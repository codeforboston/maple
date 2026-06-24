/**
 * Runs scrapers locally against the Firebase emulators by HTTP-triggering
 * the emulator's `triggerPubsubFunction` endpoint once per target. Each
 * scheduled function runs with whatever court default it picks (typically
 * `currentGeneralCourt`).
 *
 * For per-court control (single court or fan-out across every supported
 * court), see `runScrapersByCourt.ts`, which bypasses pubsub and either
 * invokes scraper functions in-process or writes batch docs directly to
 * Firestore.
 *
 * CLI options:
 *   --targets       Comma-separated scraper names to run, in order.
 *                   Defaults to every key in `scrapers` below.
 *                   Valid names: startBillBatches, startCityBatches,
 *                   startCommitteeBatches, startMemberBatches, scrapeSessions,
 *                   scrapeSpecialEvents, updateCommitteeRosters,
 *                   createMemberSearchIndex, updateBillReferences.
 *   --interval      Minimum seconds between dispatches. Default 5.
 */
import axios from "axios"
import { FunctionName } from "functions/src"
import { uniq } from "lodash"
import { z } from "zod"
import { Script } from "./types"
import { performance } from "perf_hooks"

/** All the scrapers that can be run. Scrapers are run in insertion order. */
export const scrapers: {
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

/** Shared Zod parser for the `--targets` CLI option. Splits on commas,
 * validates each name against `scrapers`, and dedupes. */
export const Targets = z
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

/** Sleeps until at least `intervalMs` has elapsed since `start`. */
export async function waitForInterval(start: number, intervalMs: number) {
  const remaining = Math.max(0, intervalMs - (performance.now() - start))
  if (remaining) {
    console.log(`pausing ${(remaining * 1e-3).toFixed(1)} s`)
    await new Promise(r => setTimeout(r, remaining))
  }
}

const Args = z.object({
  interval: z.number().default(5),
  targets: Targets
})

export const script: Script = async ({ env, args }) => {
  if (env !== "local") throw Error("only local supported")

  const { interval, targets } = Args.parse(args)
  const intervalMs = interval * 1e3

  for (const target of targets) {
    console.log("Running", target)
    const start = performance.now()
    await axios.get(
      `http://localhost:5001/demo-dtp/us-central1/triggerPubsubFunction?scheduled=${target}`
    )
    await waitForInterval(start, intervalMs)
  }
}
