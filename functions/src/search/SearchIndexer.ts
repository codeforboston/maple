import { Change } from "firebase-functions"
import { isEqual, last } from "lodash"
import hash from "object-hash"
import Collection from "typesense/lib/Typesense/Collection"
import { ImportResponse } from "typesense/lib/Typesense/Documents"
import { ImportError, ObjectNotFound } from "typesense/lib/Typesense/Errors"
import { db, DocumentData, DocumentSnapshot, QuerySnapshot } from "../firebase"
import { createClient } from "./client"
import { CollectionConfig } from "./config"
import { z } from "zod"
import { Timestamp } from "../firebase"

export const BackfillConfig = z.object({
  numBatches: z.number().positive().optional()
})
export type BackfillConfig = z.infer<typeof BackfillConfig>

export class SearchIndexer {
  private readonly batchSize = 100
  private readonly client = createClient()
  private readonly collectionName: string

  private collection: Collection | undefined

  constructor(private readonly config: CollectionConfig) {
    const schemaHash = hash(config.schema, {
      algorithm: "md5",
      unorderedArrays: true
    })
    this.collectionName = `${config.alias}_${schemaHash}`
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

  static upgradePath = (alias: string) => `/search/upgrade-${alias}`

  async scheduleUpgradeIfNeeded(backfillConfig: unknown) {
    const config = BackfillConfig.parse(backfillConfig)
    const { alias } = this.config
    const isCollectionUpToDate =
      this.collectionName === (await this.getCurrentCollectionName())
    if (!isCollectionUpToDate) {
      const upgradeDoc = db.doc(SearchIndexer.upgradePath(alias))
      await upgradeDoc.delete()
      await upgradeDoc.create({
        createdAt: Timestamp.now(),
        ...config
      })
    }
  }

  async performUpgrade(backfillConfig: unknown) {
    const config = BackfillConfig.parse(backfillConfig)
    // Ensure collection exists
    await this.getCollection()
    await this.backfill(config)
    await this.upgradeAlias()
  }

  async syncDocument(change: Change<DocumentSnapshot>) {
    const beforeData = change.before.exists ? change.before.data() : undefined
    const afterData = change.after.exists ? change.after.data() : undefined

    // if no data or doesn't match filter, delete from index
    if (!afterData || !this.passesFilter(afterData)) {
      if (beforeData && this.passesFilter(beforeData)) {
        const { id } = this.config.convert(beforeData)
        await (await this.getCollection()).documents().delete(id)
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

  private async backfill({ numBatches }: BackfillConfig) {
    const { convert } = this.config
    let currentBatch = 0
    for await (const batch of this.listCollection()) {
      currentBatch++
      if (numBatches && currentBatch > numBatches) return

      const docs = batch.reduce((acc, d) => {
        try {
          const data = d.data()
          if (!this.passesFilter(data)) return acc
          const doc = convert(data)
          acc.push(doc)
        } catch (error: any) {
          console.error(`Failed to convert document: ${error.message}`)
        }
        return acc
      }, [] as any[])
      const collection = await this.getCollection()
      try {
        await collection.documents().import(docs, { action: "upsert" })
      } catch (e) {
        if (e instanceof ImportError) {
          const results = e.importResults as unknown as ImportResponse[]
          console.error(
            results
              .map(
                r =>
                  !r.success && {
                    code: r.code,
                    error: r.error,
                    id: r.document.id
                  }
              )
              .filter(Boolean)
          )
        }
        throw e
      }
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

  private async *listCollection() {
    let token: string | undefined = ""
    while (token !== undefined) {
      const result: QuerySnapshot = await this.config.sourceCollection
        .orderBy(this.config.idField)
        .startAfter(token)
        .limit(this.batchSize)
        .get()

      const docs = result.docs.filter(d => d.exists)
      token = last(docs)?.id
      if (docs.length) yield docs
    }
  }
}
