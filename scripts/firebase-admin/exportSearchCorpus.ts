import { createHash } from "crypto"
import { mkdirSync, writeFileSync } from "fs"
import { last } from "lodash"
import { join } from "path"
import { gzipSync } from "zlib"
import "../../functions/src/bills/search"
import { getRegisteredConfigs } from "../../functions/src/search/config"
import { Script } from "./types"

const outDir = join(__dirname, "../../tests/search-eval/corpus")
const batchSize = 500

/** Extracts the bills search corpus from Firestore (run under
 * `firebase emulators:exec --import tests/integration/exportedTestData` via
 * `yarn search-eval:corpus`) using the production search converter, so the
 * eval harness indexes exactly what the app's search pipeline would.
 */
export const script: Script = async () => {
  const config = getRegisteredConfigs().find(c => c.alias === "bills")
  if (!config) throw Error("bills search config not registered")

  const docs: { id: string; court: number }[] = []
  const lines = new Map<string, string>()
  let failures = 0

  let token: string | undefined = ""
  while (token !== undefined) {
    const batch = await config.sourceCollection
      .orderBy(config.idField)
      .startAfter(token)
      .limit(batchSize)
      .get()
    const batchDocs = batch.docs.filter(d => d.exists)
    token = last(batchDocs)?.id
    for (const d of batchDocs) {
      try {
        const data = d.data()
        if (config.filter && !config.filter(data)) continue
        const doc = config.convert(data) as { id: string; court: number }
        docs.push(doc)
        lines.set(doc.id, JSON.stringify(doc))
      } catch (error: any) {
        failures++
        console.error(`Failed to convert ${d.ref.path}: ${error.message}`)
      }
    }
  }

  const jsonl =
    Array.from(lines.keys())
      .sort()
      .map(id => lines.get(id))
      .join("\n") + "\n"

  const courts: Record<string, number> = {}
  for (const doc of docs) {
    const court = String(doc.court)
    courts[court] = (courts[court] ?? 0) + 1
  }

  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, "bills.jsonl.gz"), gzipSync(jsonl))
  writeFileSync(
    join(outDir, "schema.json"),
    JSON.stringify(config.schema, null, 2) + "\n"
  )
  writeFileSync(
    join(outDir, "meta.json"),
    JSON.stringify(
      {
        collection: "bills",
        source: "tests/integration/exportedTestData",
        count: lines.size,
        courts,
        jsonlMd5: createHash("md5").update(jsonl).digest("hex")
      },
      null,
      2
    ) + "\n"
  )

  console.log(
    `Wrote ${lines.size} docs to ${outDir} (${failures} conversion failures)`
  )
}
