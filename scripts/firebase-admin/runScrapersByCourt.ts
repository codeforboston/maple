/**
 * Runs scrapers per-court against the Firebase emulators. Unlike
 * `runScrapers.ts` (which HTTP-triggers a single pubsub message per
 * target), this script bypasses pubsub and either:
 *   - invokes court-runnable scraper functions in-process per court, or
 *   - lists IDs itself, chunks them, and writes batch docs directly to
 *     `scrapers/<resource>/batches`, which the `fetchBatch` Firestore
 *     trigger consumes (see `processQueue`).
 *
 * CLI options:
 *   --targets       Comma-separated scraper names to run, in order.
 *                   Defaults to every key in `scrapers` (see runScrapers.ts).
 *                   Targets that are neither court-runnable nor batchable
 *                   (e.g. `scrapeSpecialEvents`) are skipped with a warning.
 *   --interval      Minimum seconds between dispatches. The pause runs
 *                   after each per-court invocation or batch queue.
 *                   Default 5.
 *   --concurrency   Rolling window of in-flight batch documents when
 *                   dispatching batched scrapers. Default 3.
 *   --court         A single court number (e.g. 193) to run targets
 *                   against. Must be in `supportedGeneralCourts`. Cannot
 *                   be combined with --allCourts.
 *   --allCourts     When set, fan each target out across every court in
 *                   `supportedGeneralCourts`. Cannot be combined with
 *                   --court.
 *
 * Exactly one of `--court` or `--allCourts` must be specified.
 */
import { scrapeSessionsForCourt } from "functions/src/events/scrapeEvents"
import { runUpdateBillReferences } from "functions/src/bills/updateBillReferences"
import { runUpdateCommitteeRosters } from "functions/src/committees/updateCommitteeRosters"
import { runCreateMemberSearchIndex } from "functions/src/members/createMemberSearchIndex"
import { chunk } from "lodash"
import { z } from "zod"
import { Script } from "./types"
import { performance } from "perf_hooks"
import { supportedGeneralCourts } from "functions/src/shared/constants"
import * as api from "functions/src/malegislature"
import { Targets, waitForInterval } from "./runScrapers"

type BatchableScraper = {
  resourceName: string
  resourcesPerBatch: number
  listIds: (court: number) => Promise<(string | null | undefined)[]>
}

type CourtRunnableFn = (court: number) => Promise<void>

/** Non-batchable scrapers that are court-specific and can be run for any court.
 * Typed with a plain string key rather than `FunctionName` because resolving
 * `FunctionName` against the inferred type of `updateBillReferences` (a
 * `BillProcessor.scheduled(...)` value re-exported from the same module as
 * `runUpdateBillReferences`) trips a circular-inference error. */
const courtRunnableScrapers: { [k: string]: CourtRunnableFn } = {
  scrapeSessions: scrapeSessionsForCourt,
  updateCommitteeRosters: runUpdateCommitteeRosters,
  createMemberSearchIndex: runCreateMemberSearchIndex,
  updateBillReferences: runUpdateBillReferences
}

/** Scrapers that use the batched framework and can be run for any court. */
const batchableScrapers: { [k: string]: BatchableScraper } = {
  startBillBatches: {
    resourceName: "bills",
    resourcesPerBatch: 75,
    listIds: court =>
      api.listDocuments({ court }).then(docs => docs.map(d => d.BillNumber))
  },
  startMemberBatches: {
    resourceName: "members",
    resourcesPerBatch: 5,
    listIds: court =>
      api.listMembers({ court }).then(members => members.map(m => m.MemberCode))
  },
  startCityBatches: {
    resourceName: "cities",
    resourcesPerBatch: 100,
    listIds: court => api.listCities(court)
  },
  startCommitteeBatches: {
    resourceName: "committees",
    resourcesPerBatch: 100,
    listIds: court =>
      api.listCommittees(court).then(cs => cs.map(c => c.CommitteeCode))
  }
}

const Args = z.object({
  interval: z.number().default(5),
  concurrency: z.number().default(3),
  allCourts: z.boolean().default(false),
  court: z
    .number()
    .optional()
    .refine(c => c === undefined || supportedGeneralCourts.includes(c), {
      message: `--court must be one of ${supportedGeneralCourts.join(", ")}`
    }),
  targets: Targets
})

/** Dispatches batch documents with a rolling concurrency window. Relies on
 * fetchBatch deleting its batch doc on completion to signal a free slot.
 *
 * Only counts removals of docs this run dispatched (tracked in `ours`), so
 * pre-existing or manually-deleted batch docs in the collection don't trip
 * the listener and break the concurrency cap. */
async function processQueue(
  batches: FirebaseFirestore.CollectionReference,
  court: number,
  queue: string[][],
  concurrency: number
): Promise<void> {
  let inFlight = 0
  let completed = 0
  const total = queue.length
  const ours = new Set<string>()

  const dispatchNext = async () => {
    if (queue.length === 0) return
    const ids = queue.shift()!
    inFlight++
    // Pre-allocate the ref so the ID is in `ours` before the write lands —
    // otherwise fetchBatch could finish and delete the doc before we record it.
    const ref = batches.doc()
    ours.add(ref.id)
    await ref.set({ court, ids })
  }

  return new Promise<void>((resolve, reject) => {
    let settled = false
    const finish = (err?: unknown) => {
      if (settled) return
      settled = true
      unsubscribe()
      if (err) reject(err)
      else resolve()
    }

    const unsubscribe = batches.onSnapshot(
      async snap => {
        for (const change of snap.docChanges()) {
          if (change.type !== "removed") continue
          if (!ours.delete(change.doc.id)) continue
          inFlight--
          completed++
          if (completed % 10 === 0 || completed === total) {
            console.log(`    ${completed}/${total} batches complete`)
          }
          if (queue.length > 0) {
            try {
              await dispatchNext()
            } catch (e) {
              finish(e)
              return
            }
          } else if (inFlight === 0) {
            finish()
          }
        }
      },
      err => finish(err)
    )

    ;(async () => {
      try {
        const initial = Math.min(concurrency, queue.length)
        for (let i = 0; i < initial; i++) await dispatchNext()
        if (queue.length === 0 && inFlight === 0) finish()
      } catch (e) {
        finish(e)
      }
    })()
  })
}

export const script: Script = async ({ args, db }) => {
  const { interval, concurrency, targets, allCourts, court } = Args.parse(args)
  const intervalMs = interval * 1e3

  if (allCourts && court !== undefined) {
    throw Error("--allCourts and --court cannot be combined")
  }
  if (!allCourts && court === undefined) {
    throw Error("Specify --court <N> or --allCourts")
  }

  const courts = court !== undefined ? [court] : supportedGeneralCourts

  for (const target of targets) {
    const courtRunnable = courtRunnableScrapers[target]
    if (courtRunnable) {
      for (const c of courts) {
        console.log(`Running ${target} for court ${c}`)
        const start = performance.now()
        await courtRunnable(c)
        await waitForInterval(start, intervalMs)
      }
      continue
    }

    const batchable = batchableScrapers[target]
    if (!batchable) {
      console.warn(
        `Skipping ${target}: not court-runnable or batchable in per-court mode`
      )
      continue
    }
    const { resourceName, resourcesPerBatch, listIds } = batchable
    for (const c of courts) {
      console.log(`Dispatching ${target} batches for court ${c}`)
      const start = performance.now()
      const ids = (await listIds(c)).filter(Boolean) as string[]
      const queue = chunk(ids, resourcesPerBatch)
      const total = queue.length
      console.log(
        `  ${total} batches queued for ${ids.length} IDs (concurrency=${concurrency})`
      )

      const batches = db.collection(`scrapers/${resourceName}/batches`)
      await processQueue(batches, c, queue, concurrency)
      console.log(`  Done — all ${total} batches processed`)
      await waitForInterval(start, intervalMs)
    }
  }
}
