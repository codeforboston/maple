import hash from "object-hash"
import type { CollectionConfig } from "./config"

/** Everything about a config that determines the contents of its index. */
export type CollectionVersionInputs = Pick<
  CollectionConfig,
  "alias" | "schema" | "convert" | "filter" | "convertVersion"
>

/** Names a collection after a hash of the inputs that decide what ends up in
 * it, so changing any of them yields a new name. SearchIndexer compares that
 * name against the one the alias currently points at to decide whether to
 * build and backfill a replacement.
 *
 * The hash sees `convert`'s own source text and nothing more, so changes it
 * cannot see need `convertVersion` — see its doc comment in ./config.ts.
 */
export const searchCollectionName = ({
  alias,
  schema,
  convert,
  filter,
  convertVersion
}: CollectionVersionInputs) => {
  const versionHash = hash(
    {
      schema,
      // The shapes below are what the live collections already hash to: filter
      // passes undefined when unset, convertVersion omits its key entirely.
      // Making the two consistent, in either direction, renames every
      // collection and forces a full backfill of each.
      filter: filter?.toString(),
      convert: convert.toString(),
      ...(convertVersion === undefined ? {} : { convertVersion })
    },
    { algorithm: "md5", unorderedArrays: true }
  )
  return `${alias}_${versionHash}`
}
