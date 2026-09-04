import {
  aliasForUpgradeId,
  UpgradeRun
} from "../../functions/src/search/backfillRun"
import { Script } from "./types"

/** Prints the state of every search index upgrade run.
 *
 * The Firestore-side complement to `yarn typesense-admin status`, which sees
 * only what Typesense holds. A backfill is a chain of chunk documents, so an
 * in-flight run has a cursor and a batch count here long before the alias
 * moves — which is the only way to tell "still working" from "stuck".
 *
 * Enumerates `/search` rather than taking the aliases from the config registry,
 * so a run left behind by an alias that has since been renamed or removed still
 * shows up — that run is exactly why an orphaned collection exists.
 */
const count = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`

export const script: Script = async ({ db }) => {
  const upgrades = await db.collection("search").listDocuments()

  for (const ref of upgrades) {
    const alias = aliasForUpgradeId(ref.id)
    if (!alias) continue

    const data = (await ref.get()).data() ?? {}
    const run = UpgradeRun.partial().parse(data)
    if (!run.runId || !run.totals) {
      console.log(`${alias}: scheduled, not started`)
      continue
    }

    const { totals } = run
    // Timestamps are written for operators and are not part of the schema.
    const started = data.startedAt?.toDate()
    const ended = data.finishedAt?.toDate() ?? data.updatedAt?.toDate()
    const elapsed =
      started && ended
        ? `${Math.round((ended.getTime() - started.getTime()) / 1000)}s`
        : "?"
    console.log(
      `${alias}: ${run.status} -> ${run.collectionName}\n` +
        `  ${count(totals.documents, "document")} in ` +
        `${count(totals.batches, "batch", "batches")} over ` +
        `${count(run.chunks ?? 1, "chunk")}, ${elapsed}\n` +
        `  cursor ${run.cursor ?? "(source exhausted)"}` +
        (totals.convertFailures
          ? `, ${count(totals.convertFailures, "convert failure")}`
          : "") +
        (run.numBatches ? `, limited to ${run.numBatches} batches` : "")
    )
    if (data.lastError) console.log(`  last error: ${data.lastError}`)
  }

  if (!upgrades.length) console.log("no upgrades scheduled")
}
