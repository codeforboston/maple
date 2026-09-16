import { Query } from "@google-cloud/firestore"
import { CollectionCreateSchema } from "typesense/lib/Typesense/Collections"
import { DocumentData } from "../firebase"

/** Batch size for a collection whose config does not set one. Held at the
 * historical value: the collections carrying no large free text are fine at
 * this size, and only bills needed a smaller one. */
export const DEFAULT_BATCH_SIZE = 250

export type BaseRecord = { id: string }
export type Schema = Omit<CollectionCreateSchema, "name">
export type CollectionConfig<T extends BaseRecord = BaseRecord> = {
  readonly alias: string
  readonly schema: Schema
  readonly sourceCollection: Query
  readonly documentTrigger: string
  readonly idField: string
  readonly convert: (data: DocumentData) => T
  readonly filter?: (data: DocumentData) => boolean
  /** Source documents the BACKFILL reads per batch, defaulting to
   * `DEFAULT_BATCH_SIZE`. Lower it for a collection whose records carry large
   * free text: the batch is what sits in memory at once (see
   * `MAX_BATCHES_PER_CHUNK` in ./backfillRun.ts for the rest of that story),
   * and the per-chunk log line reports the largest batch it saw. Governs
   * `SearchIndexer` only, not the export scripts. Outside the collection-name
   * hash (see ./collectionName.ts), so it forces no reindex. */
  readonly batchSize?: number
  /** Bump to force a reindex when the indexed output changed but `convert`'s
   * own source did not — the collection name hashes `convert.toString()`, which
   * covers none of the helpers, validators or defaults `convert` imports from
   * other modules. See searchCollectionName in ./collectionName.ts.
   */
  readonly convertVersion?: string | number
}

const registered: CollectionConfig[] = []
export const registerConfig = (config: CollectionConfig) => {
  registered.push(config)
}
export const getRegisteredConfigs = () => registered

/** The config for one alias. A config registers itself when its module is
 * loaded, so a miss usually means the caller forgot to require
 * `functions/src/<collection>/search` — the error names what is loaded so that
 * is visible rather than guessed at.
 */
export const configForAlias = (alias: string): CollectionConfig => {
  const config = registered.find(c => c.alias === alias)
  if (!config)
    throw Error(
      `No search config registered for "${alias}". Registered: ${
        registered.map(c => c.alias).join(", ") || "(none)"
      }`
    )
  return config
}
