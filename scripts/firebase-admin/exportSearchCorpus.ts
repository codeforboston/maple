import { last } from "lodash"
// Imported for the registerConfig side effect — all three, so any alias the
// caller passes resolves rather than only bills.
import "../../functions/src/bills/search"
import "../../functions/src/hearings/search"
import "../../functions/src/testimony/search"
import type { QueryDocumentSnapshot } from "../../functions/src/firebase"
import { configForAlias } from "../../functions/src/search/config"
import { corpusDir } from "../search-eval/corpus"
import { ExportedDoc, writeCorpus } from "../search-eval/corpusFiles"
import { Script } from "./types"

const batchSize = 500

/** Extracts a search corpus from the emulator, seeded from the committed test
 * fixture, using the production search converter — so the eval harness indexes
 * exactly what the app's search pipeline would.
 *
 * This is the bills path (`yarn search-eval:corpus`). It uses the admin SDK,
 * which bypasses security rules; an unauthenticated collectionGroup("bills")
 * read is denied because the bills rule is path-scoped to generalCourts/**.
 *
 * Hearings and testimony come from a live project instead — the fixture holds
 * ~21 hearings and lorem-ipsum testimony — and need no credentials at all:
 *
 *   yarn search-eval corpus --env prod --alias hearings
 *
 * See tests/search-eval/README.md.
 */
export const script: Script = async ({ args }) => {
  const alias: string = args.argv?.[0]
  if (!alias)
    throw Error(
      "Pass the collection alias, e.g. `run-script exportSearchCorpus --env local bills`"
    )

  const config = configForAlias(alias)

  const docs: ExportedDoc[] = []
  let failures = 0

  // A snapshot cursor, not the trailing id value: a snapshot carries the
  // document-name tiebreak, where a value cursor positions after ALL documents
  // equal to it — and bill numbers repeat across courts in the bills
  // collection group, so a value cursor would silently drop the rest of a
  // boundary-straddling group (the same hazard SearchIndexer.listPage
  // documents).
  let cursor: QueryDocumentSnapshot | undefined
  for (;;) {
    let query = config.sourceCollection.orderBy(config.idField).limit(batchSize)
    if (cursor) query = query.startAfter(cursor)
    const batch = await query.get()
    for (const d of batch.docs) {
      try {
        const data = d.data()
        if (config.filter && !config.filter(data)) continue
        docs.push(config.convert(data) as ExportedDoc)
      } catch (error: any) {
        failures++
        console.error(`Failed to convert ${d.ref.path}: ${error.message}`)
      }
    }
    cursor = last(batch.docs)
    if (batch.size < batchSize) break
  }

  const count = writeCorpus({
    alias,
    source: "tests/integration/exportedTestData",
    docs,
    schema: config.schema
  })

  console.log(
    `Wrote ${count} docs to ${corpusDir(
      alias
    )} (${failures} conversion failures)`
  )
}
