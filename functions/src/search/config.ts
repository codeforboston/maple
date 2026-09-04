import { Query } from "@google-cloud/firestore"
import { CollectionCreateSchema } from "typesense/lib/Typesense/Collections"
import { DocumentData } from "../firebase"

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
