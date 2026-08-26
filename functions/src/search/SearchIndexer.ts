import { Change } from "firebase-functions"
import { isEqual, last } from "lodash"
import Collection from "typesense/lib/Typesense/Collection"
import { ImportError, ObjectNotFound } from "typesense/lib/Typesense/Errors"
import {
  db,
  DocumentData,
  DocumentSnapshot,
  QueryDocumentSnapshot
} from "../firebase"
import { BackfillConfig, upgradePath } from "./backfillRun"
import { createClient } from "./client"
import { searchCollectionName } from "./collectionName"
import { CollectionConfig } from "./config"
import { Timestamp } from "../firebase"

/** Ceiling on one `documents().import()` body, held far enough under the 10 MB
 * maximum payload of the AWS API Gateway HTTP API these collections sit behind
 * that headers and encoding cannot push a batch over it. A batch over the cap
 * is rejected outright and would fail the same way on every retry. Budgeting
 * the import by serialized bytes rather than by document count is what makes
 * that impossible: bills carry their full text in `body`, so a fixed count is
 * safe at the mean and unsafe in the tail.
 */
export const IMPORT_BYTE_BUDGET = 6 * 1024 * 1024

export type BackfillChunkResult = {
  /** `startAfter` value for the next chunk, or null when the source is spent. */
  cursor: string | null
  batches: number
  documents: number
  convertFailures: number
}

export class SearchIndexer {
  /** How many source documents to read per Firestore page. Independent of the
   * import payload, which `importInSlices` sizes by bytes. */
  private readonly batchSize = 250
  private readonly client = createClient()
  private readonly collectionName: string

  private collection: Collection | undefined

  constructor(private readonly config: CollectionConfig) {
    this.collectionName = searchCollectionName(config)
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
    const { convert } = this.config
    const deadline = Date.now() + budgetMs
    let cursor: string | null = startAfter
    let batches = 0
    let documents = 0
    let convertFailures = 0

    while (maxBatches === undefined || batches < maxBatches) {
      // Checked after the first page so a chunk always makes progress, however
      // little budget it inherited.
      if (batches > 0 && Date.now() >= deadline) break

      const page = await this.listPage(cursor)
      cursor = page.cursor

      if (page.docs.length) {
        batches++
        const docs = page.docs.reduce((acc, d) => {
          try {
            const data = d.data()
            if (!this.passesFilter(data)) return acc
            acc.push(convert(data))
          } catch (error: any) {
            convertFailures++
            console.error(`Failed to convert document: ${error.message}`)
          }
          return acc
        }, [] as any[])

        await this.importInSlices(docs)
        documents += docs.length
      }

      if (cursor === null) break
    }

    return { cursor, batches, documents, convertFailures }
  }

  private async importInSlices(docs: any[]) {
    if (!docs.length) return
    const collection = await this.getCollection()
    let slice: any[] = []
    let bytes = 0

    const flush = async () => {
      if (!slice.length) return
      await this.importDocuments(collection, slice)
      slice = []
      bytes = 0
    }

    for (const doc of docs) {
      // Bytes, not string length: the cap is on the encoded body, and `.length`
      // counts UTF-16 units, which undercounts anything non-ASCII. +1 for the
      // newline the client joins the JSONL body with.
      const size = Buffer.byteLength(JSON.stringify(doc)) + 1
      if (slice.length && bytes + size > IMPORT_BYTE_BUDGET) await flush()
      slice.push(doc)
      bytes += size
    }
    await flush()
  }

  private async importDocuments(collection: Collection, docs: any[]) {
    try {
      await collection.documents().import(docs, { action: "upsert" })
    } catch (e) {
      if (e instanceof ImportError) {
        console.error(
          e.importResults
            .filter(r => !r.success)
            .map(r => ({
              code: r.code,
              error: r.error,
              id: r.id ?? r.document?.id
            }))
        )
      }
      throw e
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

  /** One ordered page of the source, with the cursor to resume after it — null
   * once the source is exhausted, which a short page already tells us.
   *
   * The cursor is the last document's `idField` value, not its document id: the
   * query orders by `idField`, so that is the value Firestore compares against,
   * and it is the one that has to survive being written into a chunk document.
   */
  private async listPage(startAfter: string | null): Promise<{
    docs: QueryDocumentSnapshot[]
    cursor: string | null
  }> {
    let query = this.config.sourceCollection
      .orderBy(this.config.idField)
      .limit(this.batchSize)
    if (startAfter !== null) query = query.startAfter(startAfter)

    const { docs } = await query.get()
    const tail = docs.length < this.batchSize ? undefined : last(docs)
    return {
      docs,
      cursor: tail ? tail.get(this.config.idField) ?? tail.id : null
    }
  }
}
