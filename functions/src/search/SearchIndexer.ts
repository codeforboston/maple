import { Change } from "firebase-functions"
import { isEqual, last } from "lodash"
import Collection from "typesense/lib/Typesense/Collection"
import { ObjectNotFound } from "typesense/lib/Typesense/Errors"
import {
  db,
  DocumentData,
  DocumentSnapshot,
  FieldPath,
  QueryDocumentSnapshot
} from "../firebase"
import { BackfillConfig, upgradePath } from "./backfillRun"
import { createClient } from "./client"
import { searchCollectionName } from "./collectionName"
import { CollectionConfig, DEFAULT_BATCH_SIZE } from "./config"
import { forceGc } from "./forceGc"
import { Timestamp } from "../firebase"

/** Ceiling on one `documents().import()` body — one slice, which is the unit
 * `importBatch` ships and never the unit a budget counts: a batch is one whole
 * read of the source, and a batch can flush several slices. Held far enough
 * under the
 * 10 MB maximum payload of the AWS API Gateway HTTP API these collections sit
 * behind that headers and encoding cannot push a slice over it. A slice over
 * the cap is rejected outright and would fail the same way on every retry.
 * Budgeting the import by serialized bytes rather than by document count is
 * what makes that impossible: bills carry their full text in `body`, so a
 * fixed count is safe at the mean and unsafe in the tail.
 */
export const IMPORT_BYTE_BUDGET = 6 * 1024 * 1024

export type BackfillChunkResult = {
  /** Document path the next chunk resumes `startAfter`, or null when the
   * source is spent. */
  cursor: string | null
  /** Batches imported. A batch is one read of the source — `batchSize`
   * documents, converted and imported together, and the whole of what this
   * chunk holds in memory at once. It is the unit every budget counts:
   * `maxBatches` here, `MAX_BATCHES_PER_CHUNK` and the run's `numBatches` in
   * ./backfillRun.ts. */
  batches: number
  documents: number
  convertFailures: number
  /** Serialized size of everything this chunk imported, across every batch. */
  bytes: number
  /** The largest single batch in this chunk. A batch is what sits in memory at
   * once, so this — not the chunk total — is the number to read when choosing a
   * config's `batchSize`. */
  peakBatchBytes: number
  /** Highest resident memory seen after importing a batch, before the forced
   * collection. This is the figure the container kills on. */
  peakRssBytes: number
  /** Highest resident memory seen after a forced collection. Flat across
   * batches means the collection reclaims what a batch allocates; climbing
   * means something is retained between batches. All four figures are logged
   * rather than persisted: the run's `Totals` are a checkpoint a replayed
   * chunk must reproduce exactly. */
  peakRssAfterGcBytes: number
}

/** The id of a failed import's `document`, which the server echoes back as the
 * original JSONL line (a string) — parsed defensively, for logs only. */
const failedDocumentId = (document: unknown): string | undefined => {
  try {
    return typeof document === "string"
      ? JSON.parse(document).id
      : (document as { id?: string } | undefined)?.id
  } catch {
    return undefined
  }
}

export class SearchIndexer {
  /** How many source documents to read per batch. Independent of the import
   * payload, which `importBatch` sizes by bytes. */
  private readonly batchSize: number
  private readonly client = createClient()
  private readonly collectionName: string

  private collection: Collection | undefined

  constructor(private readonly config: CollectionConfig) {
    this.collectionName = searchCollectionName(config)
    const batchSize = config.batchSize ?? DEFAULT_BATCH_SIZE
    // Rejected loudly rather than passed to `limit()`: a zero or fractional
    // batch size makes the first batch come back empty, which `listBatch`
    // reports
    // as a null cursor, which the run reads as "source exhausted" — so the
    // alias would be swapped onto an empty collection and the live one dropped.
    if (!Number.isInteger(batchSize) || batchSize < 1)
      throw Error(
        `Invalid batchSize ${batchSize} for search config ${config.alias}`
      )
    this.batchSize = batchSize
  }

  private passesFilter(data: DocumentData | undefined) {
    if (!data) return false
    if (!this.config.filter) return true
    try {
      return this.config.filter(data)
    } catch (error) {
      console.error("Filter function threw", error)
      return false
    }
  }

  /** The collection this config currently hashes to. A chunk compares it
   * against the name recorded on the run to notice that the deployed code
   * changed underneath an in-flight backfill. */
  get targetCollectionName() {
    return this.collectionName
  }

  async scheduleUpgradeIfNeeded(backfillConfig: unknown) {
    const config = BackfillConfig.parse(backfillConfig)
    const { alias } = this.config
    const isCollectionUpToDate =
      this.collectionName === (await this.getCurrentCollectionName())
    console.log(`Index for alias ${alias} up to date: ${isCollectionUpToDate}`)
    if (!isCollectionUpToDate) {
      console.log(`Scheduling upgrade for alias ${alias}`)
      const upgradeDoc = db.doc(upgradePath(alias))
      // Recursive, not a plain delete: deleting a document leaves its
      // subcollections behind, and a surviving `chunks/0` from the previous run
      // would make this run's `create` throw.
      await db.recursiveDelete(upgradeDoc)
      await upgradeDoc.create({
        createdAt: Timestamp.now(),
        ...config
      })
    }
  }

  /** Ensures the target collection exists so chunks can import into it. */
  async beginUpgrade() {
    await this.getCollection()
  }

  /** Points the alias at the freshly backfilled collection and drops the old
   * one. Only called once the source is exhausted. */
  async finishUpgrade() {
    await this.upgradeAlias()
  }

  async syncDocument(change: Change<DocumentSnapshot>) {
    const beforeData = change.before.exists ? change.before.data() : undefined
    const afterData = change.after.exists ? change.after.data() : undefined

    // if no data or doesn't match filter, delete from index
    if (!afterData || !this.passesFilter(afterData)) {
      if (beforeData && this.passesFilter(beforeData)) {
        const { id } = this.config.convert(beforeData)
        await (await this.getCollection()).documents(id).delete()
      }
      return
    }

    const after = this.config.convert(afterData)

    // update if previous data doesn't exist, didn't match, or if the converted data changed
    if (
      !beforeData ||
      !this.passesFilter(beforeData) ||
      !isEqual(this.config.convert(beforeData), after)
    ) {
      await (await this.getCollection()).documents().upsert(after)
    }
  }

  private async getCurrentCollectionName() {
    try {
      const alias = await this.client.aliases(this.config.alias).retrieve()
      return alias.collection_name
    } catch (e) {
      if (e instanceof ObjectNotFound) return null
      else throw e
    }
  }

  private async getCollection() {
    if (!this.collection) {
      const collection = this.client.collections(this.collectionName)
      const exists = await collection.exists()
      console.log("Collection exists", exists)
      if (!exists) await this.createCollection()
      this.collection = collection
    }
    return this.collection
  }

  private async createCollection() {
    await this.client
      .collections()
      .create({ name: this.collectionName, ...this.config.schema })
  }

  /** Moves as much of the source into the target collection as the given budget
   * allows, starting after `startAfter`, and reports where it stopped. A null
   * cursor in the result means the source is exhausted; anything else is the
   * checkpoint the next chunk resumes from.
   */
  async backfillChunk({
    startAfter,
    maxBatches,
    budgetMs
  }: {
    startAfter: string | null
    maxBatches?: number
    budgetMs: number
  }): Promise<BackfillChunkResult> {
    const deadline = Date.now() + budgetMs
    let cursor: string | null = startAfter
    let batches = 0
    let documents = 0
    let convertFailures = 0
    let bytes = 0
    let peakBatchBytes = 0
    let peakRssBytes = 0
    let peakRssAfterGcBytes = 0

    while (maxBatches === undefined || batches < maxBatches) {
      // Checked after the first batch so a chunk always makes progress, however
      // little budget it inherited.
      if (batches > 0 && Date.now() >= deadline) break

      const batch = await this.listBatch(cursor)
      cursor = batch.cursor

      if (batch.docs.length) {
        batches++
        const imported = await this.importBatch(batch.docs)
        documents += imported.documents
        convertFailures += imported.convertFailures
        bytes += imported.bytes
        peakBatchBytes = Math.max(peakBatchBytes, imported.bytes)

        // Reclaim the batch before fetching the next one — see ./forceGc.ts.
        // Dropping the snapshots first is what makes that possible: `batch` is
        // still a live local in this frame, so a collection while it holds them
        // would reclaim only the PREVIOUS batch and leave this one resident,
        // both raising the real footprint to two batches and putting a batch's
        // worth of noise into the after-gc figure below.
        peakRssBytes = Math.max(peakRssBytes, process.memoryUsage.rss())
        batch.docs.length = 0
        forceGc()
        peakRssAfterGcBytes = Math.max(
          peakRssAfterGcBytes,
          process.memoryUsage.rss()
        )
      }

      if (cursor === null) break
    }

    return {
      cursor,
      batches,
      documents,
      convertFailures,
      bytes,
      peakBatchBytes,
      peakRssBytes,
      peakRssAfterGcBytes
    }
  }

  /** Converts and imports one batch of snapshots, splitting the import into
   * request-sized slices. Each document is converted, serialized and dropped in
   * the same iteration, so the converted batch never exists as a whole: what is
   * live at once is the snapshots plus at most one slice of lines. */
  private async importBatch(snapshots: QueryDocumentSnapshot[]) {
    const { convert } = this.config
    const collection = await this.getCollection()
    let slice: string[] = []
    let sliceBytes = 0
    let documents = 0
    let convertFailures = 0
    let bytes = 0

    // Releases the line array before the round trip: the joined body is the
    // copy that ships, and reassigning the captured `let` is what frees this one.
    const flush = async () => {
      if (!slice.length) return
      const body = slice.join("\n")
      bytes += sliceBytes
      slice = []
      sliceBytes = 0
      await this.importDocuments(collection, body)
    }

    for (const snapshot of snapshots) {
      let doc: any
      try {
        const data = snapshot.data()
        if (!this.passesFilter(data)) continue
        doc = convert(data)
      } catch (error: any) {
        convertFailures++
        console.error(`Failed to convert document: ${error.message}`)
        continue
      }
      documents++

      // Serialized once, here: the same line is measured against the budget
      // and shipped as the import body, rather than stringified a second time
      // inside the client. Bytes, not string length: the cap is on the encoded
      // body, and `.length` counts UTF-16 units, which undercounts anything
      // non-ASCII. +1 for the JSONL newline.
      const line = JSON.stringify(doc)
      const size = Buffer.byteLength(line) + 1
      if (slice.length && sliceBytes + size > IMPORT_BYTE_BUDGET) await flush()
      slice.push(line)
      sliceBytes += size
    }
    await flush()
    return { documents, convertFailures, bytes }
  }

  /** Imports pre-serialized JSONL lines. The client's string form returns the
   * raw per-line results WITHOUT throwing ImportError — only its array form
   * does — so failures are detected here, and must be: a silently rejected
   * slice would otherwise count as progress. */
  private async importDocuments(collection: Collection, body: string) {
    const response = await collection
      .documents()
      .import(body, { action: "upsert" })
    const results = String(response)
      .split("\n")
      .map(line => JSON.parse(line))
    const failures = results.filter(r => r.success === false)
    if (failures.length) {
      console.error(
        failures.map(r => ({
          code: r.code,
          error: r.error,
          id: failedDocumentId(r.document)
        }))
      )
      throw Error(
        `${failures.length} of ${results.length} documents failed to import`
      )
    }
  }

  private async upgradeAlias() {
    const { alias } = this.config
    console.log("Upgrading alias", alias)
    const obsoleteCollection = await this.getCurrentCollectionName()
    console.log(
      "Upgrading collection",
      obsoleteCollection,
      "to",
      this.collectionName
    )
    await this.client
      .aliases()
      .upsert(alias, { collection_name: this.collectionName })
    if (obsoleteCollection && obsoleteCollection !== this.collectionName) {
      const collection = this.client.collections(obsoleteCollection)
      const exists = await collection.exists()
      if (exists) {
        await collection.delete()
      }
    }
  }

  /** One ordered batch of the source, with the cursor to resume after it —
   * null once the source is exhausted, which a short batch already tells us.
   *
   * Ordered by document name, with the last document's path as the cursor: the
   * one ordering Firestore always serves without an index, and the one value
   * unique per document, so it survives being written into a chunk document.
   * Ordering by `idField` instead would make the persisted value-cursor skip
   * documents — Firestore positions a value cursor after ALL documents equal
   * to it, and bills' collectionGroup holds the same bill number once per
   * general court, adjacent in that ordering, so batch boundaries would
   * silently drop the rest of a boundary-straddling group from the index.
   */
  private async listBatch(startAfter: string | null): Promise<{
    docs: QueryDocumentSnapshot[]
    cursor: string | null
  }> {
    let query = this.config.sourceCollection
      .orderBy(FieldPath.documentId())
      .limit(this.batchSize)
    if (startAfter !== null) query = query.startAfter(db.doc(startAfter))

    const { docs } = await query.get()
    const tail = docs.length < this.batchSize ? undefined : last(docs)
    return {
      docs,
      cursor: tail ? tail.ref.path : null
    }
  }
}
