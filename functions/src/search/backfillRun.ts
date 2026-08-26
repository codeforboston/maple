import { z } from "zod"

/** An index upgrade is a chain of bounded chunks rather than one invocation.
 *
 * The run lives at `/search/upgrade-<alias>`; each chunk is a document in that
 * run's `chunks` subcollection, and finishing a chunk writes the next one. The
 * chunk document is the checkpoint: it carries both the cursor to resume from
 * and the run totals as of its creation, so a chunk that times out or throws is
 * replayed from its own starting point and converges on the same numbers rather
 * than adding its work to the run twice.
 */

/** Wall-clock a single chunk spends paging before it hands off. The chunk
 * function gets the 540s v1 ceiling; the remainder is room to write progress
 * and create the successor after the budget runs out mid-page. */
export const CHUNK_BUDGET_MS = 300_000

/** Loop guard. Nothing legitimate reaches this — bills is ~49k documents at 250
 * per batch, and one chunk covers hundreds of batches — so hitting it means the
 * cursor stopped advancing, and the run fails loudly instead of chaining. */
export const MAX_CHUNKS = 500

/** `failurePolicy: true` retries the same event for up to seven days. Past this
 * age the chunk gives up and marks the run failed, so a poisoned chunk cannot
 * retry indefinitely. */
export const MAX_EVENT_AGE_MS = 30 * 60_000

const UPGRADE_PREFIX = "upgrade-"

export const upgradePath = (alias: string) =>
  `/search/${UPGRADE_PREFIX}${alias}`

export const chunkPath = (alias: string, index: number) =>
  `${upgradePath(alias)}/chunks/${index}`

/** Recovers the alias from an upgrade document's id, or null for a document
 * under `/search` that is not an upgrade run. */
export const aliasForUpgradeId = (upgradeId: string) =>
  upgradeId.startsWith(UPGRADE_PREFIX)
    ? upgradeId.slice(UPGRADE_PREFIX.length)
    : null

/** How much of the source a run has moved so far. Carried on the chunk document
 * as the baseline for that chunk, and on the run as the live total. */
export const Totals = z.object({
  batches: z.number().int().nonnegative(),
  documents: z.number().int().nonnegative(),
  convertFailures: z.number().int().nonnegative()
})
export type Totals = z.infer<typeof Totals>

export const NO_TOTALS: Totals = {
  batches: 0,
  documents: 0,
  convertFailures: 0
}

/** The only knob a scheduled upgrade takes: a whole-run batch budget that builds
 * a deliberately partial index and swaps the alias anyway. A batch is one source
 * page, so the document count it corresponds to is `numBatches * batchSize` —
 * see `SearchIndexer.batchSize`. */
export const BackfillConfig = z.object({
  numBatches: z.number().positive().optional()
})
export type BackfillConfig = z.infer<typeof BackfillConfig>

export const ChunkDoc = z.object({
  runId: z.string(),
  index: z.number().int().nonnegative(),
  /** Exclusive `startAfter` value for `idField`; null starts from the top. */
  cursor: z.string().nullable(),
  before: Totals
})
export type ChunkDoc = z.infer<typeof ChunkDoc>

/** The run document. Timestamps are written for operators and never parsed, so
 * they stay out of the schema. */
export const UpgradeRun = BackfillConfig.extend({
  runId: z.string(),
  collectionName: z.string(),
  status: z.enum(["running", "done", "failed"]),
  cursor: z.string().nullable(),
  totals: Totals,
  chunks: z.number().int().positive()
})
export type UpgradeRun = z.infer<typeof UpgradeRun>

export type NextChunk =
  | { type: "done" }
  | { type: "failed"; error: string }
  | { type: "next"; chunk: ChunkDoc }

/** Decides what happens after a chunk finishes: swap the alias, chain another
 * chunk, or fail the run. Kept pure so the `numBatches` budget and the loop
 * guard are settled in one place that tests can reach without Firestore.
 */
export const nextChunk = ({
  runId,
  index,
  cursor,
  totals,
  numBatches
}: {
  runId: string
  index: number
  cursor: string | null
  totals: Totals
  numBatches?: number
}): NextChunk => {
  if (cursor === null) return { type: "done" }
  if (numBatches !== undefined && totals.batches >= numBatches)
    return { type: "done" }
  if (index + 1 >= MAX_CHUNKS)
    return {
      type: "failed",
      error: `Backfill exceeded ${MAX_CHUNKS} chunks at cursor ${cursor}; the cursor is not advancing`
    }
  return {
    type: "next",
    chunk: { runId, index: index + 1, cursor, before: totals }
  }
}
