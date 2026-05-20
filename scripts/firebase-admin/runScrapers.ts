/**
 * Runs scrapers locally against the Firebase emulators.
 *
 * CLI options:
 *   --targets       Comma-separated scraper names to run, in order.
 *                   Defaults to every key in `scrapers` below.
 *                   Valid names: startBillBatches, startCityBatches,
 *                   startCommitteeBatches, startMemberBatches, scrapeSessions,
 *                   scrapeSpecialEvents, updateCommitteeRosters,
 *                   createMemberSearchIndex, updateBillReferences.
 *   --interval      Minimum seconds between dispatches. The pause runs
 *                   after each target in the default mode, and after each
 *                   per-court invocation or batch queue in --allCourts mode
 *                   (fallback pubsub scrapers still pause once per target).
 *                   Default 5.
 *   --concurrency   Rolling window of in-flight batch documents when
 *                   dispatching batched scrapers in --allCourts mode.
 *                   Default 3.
 *   --allCourts     When set, fan each target out across every court in
 *                   `supportedGeneralCourts`. Court-runnable scrapers are
 *                   invoked in-process per court; batchable scrapers list
 *                   their IDs, chunk them, and dispatch via `processQueue`.
 *                   Targets that are neither (e.g. `scrapeSpecialEvents`)
 *                   are skipped with a warning.
 *                   Default false (single pubsub trigger per target,
 *                   matching the original behavior).
 */
import axios from "axios"
import { FunctionName } from "functions/src"
import { scrapeSessionsForCourt } from "functions/src/events/scrapeEvents"
import { runUpdateBillReferences } from "functions/src/bills/updateBillReferences"
import { runUpdateCommitteeRosters } from "functions/src/committees/updateCommitteeRosters"
import { runCreateMemberSearchIndex } from "functions/src/members/createMemberSearchIndex"
import { chunk, uniq } from "lodash"
import { z } from "zod"
import { Script } from "./types"
import { performance } from "perf_hooks"
import { supportedGeneralCourts } from "functions/src/shared/constants"
import * as api from "functions/src/malegislature"

/** All the scrapers that can be run. Scrapers are run in insertion order. */
const scrapers: {
  [K in FunctionName]?: K
} = {
  startBillBatches: "startBillBatches",
  startCityBatches: "startCityBatches",
  startCommitteeBatches: "startCommitteeBatches",
  startMemberBatches: "startMemberBatches",
  // scrapeHearings: "scrapeHearings",
  scrapeSessions: "scrapeSessions",
  scrapeSpecialEvents: "scrapeSpecialEvents",
  updateCommitteeRosters: "updateCommitteeRosters",
  createMemberSearchIndex: "createMemberSearchIndex",
  updateBillReferences: "updateBillReferences"
}

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
    resourcesPerBatch: 150,
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
    resourcesPerBatch: 200,
    listIds: court => api.listCities(court)
  },
  startCommitteeBatches: {
    resourceName: "committees",
    resourcesPerBatch: 200,
    listIds: court =>
      api.listCommittees(court).then(cs => cs.map(c => c.CommitteeCode))
  }
}

const Args = z.object({
  interval: z.number().default(5),
  concurrency: z.number().default(3),
  allCourts: z.boolean().default(false),
  targets: z
    .string()
    .transform(s => {
      const t = s
        .split(",")
        .map(s => s.trim())
        .map(name => {
          const s = scrapers[name as FunctionName]
          if (!s) throw Error(`Invalid scraper ${name}`)
          return s
        })
      return uniq(t)
    })
    .default(Object.keys(scrapers).join(",")) as z.ZodType<
    Array<FunctionName>,
    any,
    string
  >
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
  const { interval, concurrency, targets, allCourts } = Args.parse(args)
  const intervalMs = interval * 1e3

  const waitForInterval = async (start: number) => {
    const remaining = Math.max(0, intervalMs - (performance.now() - start))
    if (remaining) {
      console.log(`pausing ${(remaining * 1e-3).toFixed(1)} s`)
      await new Promise(r => setTimeout(r, remaining))
    }
  }

  if (allCourts) {
    for (const target of targets) {
      const courtRunnable = courtRunnableScrapers[target]
      if (courtRunnable) {
        for (const court of supportedGeneralCourts) {
          console.log(`Running ${target} for court ${court}`)
          const start = performance.now()
          await courtRunnable(court)
          await waitForInterval(start)
        }
        continue
      }

      const batchable = batchableScrapers[target]
      if (!batchable) {
        console.warn(
          `Skipping ${target}: not court-runnable or batchable in --allCourts mode`
        )
        continue
      }
      const { resourceName, resourcesPerBatch, listIds } = batchable
      for (const court of supportedGeneralCourts) {
        console.log(`Dispatching ${target} batches for court ${court}`)
        const start = performance.now()
        const ids = (await listIds(court)).filter(Boolean) as string[]
        const queue = chunk(ids, resourcesPerBatch)
        const total = queue.length
        console.log(`  ${total} batches queued for ${ids.length} IDs (concurrency=${concurrency})`)

        const batches = db.collection(`scrapers/${resourceName}/batches`)
        await processQueue(batches, court, queue, concurrency)
        console.log(`  Done — all ${total} batches processed`)
        await waitForInterval(start)
      }
    }
    return
  }

  for (const target of targets) {
    console.log("Running", target)
    const start = performance.now()
    await axios.get(
      `http://localhost:5001/demo-dtp/us-central1/triggerPubsubFunction?scheduled=${target}`
    )
    await waitForInterval(start)
  }
}
