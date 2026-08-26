import { createHash } from "crypto"
import { existsSync, readFileSync } from "fs"
import { join } from "path"
import { gunzipSync } from "zlib"
import { createClient } from "../../functions/src/search/client"

export const corpusDir = join(__dirname, "../../tests/search-eval/corpus")

export type CorpusDoc = {
  id: string
  court: number
  number: string
  title: string
  body?: string
  primarySponsor?: string
  cosponsors: string[]
  currentCommittee?: string
}

export type CorpusMeta = {
  collection: string
  source: string
  count: number
  courts: Record<string, number>
  jsonlMd5: string
}

export function readMeta(): CorpusMeta {
  return JSON.parse(readFileSync(join(corpusDir, "meta.json"), "utf8"))
}

/** The court the eval filters on, mirroring the app's court refinement:
 * the court with the most bills in the corpus.
 */
export function majorityCourt(meta: CorpusMeta): number {
  const courts = Object.entries(meta.courts).sort((a, b) => b[1] - a[1])
  if (!courts.length) throw Error("corpus meta lists no courts")
  return Number(courts[0][0])
}

export function readCorpus(): { docs: CorpusDoc[]; jsonl: string } {
  const path = join(corpusDir, "bills.jsonl.gz")
  if (!existsSync(path)) {
    throw Error(
      `${path} not found. Generate it with: yarn search-eval:corpus (requires the firebase CLI; takes a minute or two)`
    )
  }
  const jsonl = gunzipSync(readFileSync(path)).toString("utf8")

  const meta = readMeta()
  const md5 = createHash("md5").update(jsonl).digest("hex")
  if (md5 !== meta.jsonlMd5) {
    throw Error(
      `Corpus hash mismatch: bills.jsonl.gz has md5 ${md5} but meta.json expects ${meta.jsonlMd5}. Regenerate with: yarn search-eval:corpus`
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
 * the corpus. Uses a dedicated collection (default bills_eval) so the
 * dev-workflow "bills" alias is never touched.
 */
export async function seedCollection(
  client: ReturnType<typeof createClient>,
  collection: string
): Promise<void> {
  const { docs, jsonl } = readCorpus()
  const schema = JSON.parse(
    readFileSync(join(corpusDir, "schema.json"), "utf8")
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
