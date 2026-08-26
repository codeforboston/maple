import { createHash } from "crypto"
import { existsSync, readFileSync } from "fs"
import { join } from "path"
import { gunzipSync } from "zlib"
import { createClient } from "../../functions/src/search/client"
import { resolveEvalCollection } from "./collections"

export const corpusRoot = join(__dirname, "../../tests/search-eval/corpus")

export const corpusDir = (alias: string) => join(corpusRoot, alias)

/** A corpus document: whatever the collection's converter emits. Only `id` and
 * `court` are read by the harness itself; golden rules resolve the rest by name.
 */
export type CorpusDoc = { id: string; court: number } & Record<string, unknown>

export type CorpusMeta = {
  alias: string
  source: string
  count: number
  courts: Record<string, number>
  jsonlMd5: string
  /** Present when the export capped the document count. */
  limit?: number
  /** The Firestore ordering the export paged in, e.g. "publishedAt:desc". */
  orderBy?: string
  /** Fields overwritten at export time; never fields the eval searches. */
  redacted?: string[]
  /** Fields copied in from a live project after export, for fields the corpus's
   * own source predates. One entry per join. See the `enrich` subcommand.
   */
  enriched?: { field: string; source: string; count: number }[]
}

const regenerate = (alias: string) =>
  `${resolveEvalCollection(alias).regenerate.join(
    " && "
  )} (see tests/search-eval/README.md)`

export function readMeta(alias: string): CorpusMeta {
  return JSON.parse(readFileSync(join(corpusDir(alias), "meta.json"), "utf8"))
}

/** The court the eval filters on, mirroring the app's court refinement:
 * the court with the most documents in the corpus.
 */
export function majorityCourt(meta: CorpusMeta): number {
  const courts = Object.entries(meta.courts).sort((a, b) => b[1] - a[1])
  if (!courts.length) throw Error("corpus meta lists no courts")
  return Number(courts[0][0])
}

export function readCorpus(alias: string): {
  docs: CorpusDoc[]
  jsonl: string
} {
  const path = join(corpusDir(alias), "docs.jsonl.gz")
  if (!existsSync(path)) {
    throw Error(`${path} not found. Generate it with: ${regenerate(alias)}`)
  }
  const jsonl = gunzipSync(readFileSync(path)).toString("utf8")

  const meta = readMeta(alias)
  const md5 = createHash("md5").update(jsonl).digest("hex")
  if (md5 !== meta.jsonlMd5) {
    throw Error(
      `Corpus hash mismatch: ${alias}/docs.jsonl.gz has md5 ${md5} but meta.json expects ${
        meta.jsonlMd5
      }. Regenerate with: ${regenerate(alias)}`
    )
  }

  const docs = jsonl
    .split("\n")
    .filter(Boolean)
    .map(line => JSON.parse(line) as CorpusDoc)
  if (docs.length !== meta.count)
    throw Error(
      `Corpus has ${docs.length} docs, meta.json expects ${meta.count}`
    )
  return { docs, jsonl }
}

/** Drops and recreates `collection` from the committed schema, then imports
 * the corpus. Uses a dedicated collection (default <alias>_eval) so the
 * dev-workflow aliases are never touched.
 */
export async function seedCollection(
  client: ReturnType<typeof createClient>,
  alias: string,
  collection: string
): Promise<void> {
  const { docs, jsonl } = readCorpus(alias)
  const schema = JSON.parse(
    readFileSync(join(corpusDir(alias), "schema.json"), "utf8")
  )

  const existing = await client.collections().retrieve()
  if (existing.some((c: { name: string }) => c.name === collection)) {
    await client.collections(collection).delete()
  }
  await client.collections().create({ name: collection, ...schema })

  const lines = jsonl.split("\n").filter(Boolean)
  const chunkSize = 1000
  for (let i = 0; i < lines.length; i += chunkSize) {
    // Raw JSONL string form works identically on typesense client 1.x and 3.x
    await client
      .collections(collection)
      .documents()
      .import(lines.slice(i, i + chunkSize).join("\n"), { action: "create" })
  }

  const created = await client.collections(collection).retrieve()
  if (created.num_documents !== docs.length) {
    throw Error(
      `Seeded ${created.num_documents} documents, expected ${docs.length}`
    )
  }
  console.log(`Seeded ${created.num_documents} docs into "${collection}"`)
}
