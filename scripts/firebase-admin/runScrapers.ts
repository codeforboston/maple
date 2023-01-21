import axios from "axios"
import { FunctionName } from "functions/src"
import { uniq } from "lodash"
import { z } from "zod"
import { Script } from "./types"
import { performance } from "perf_hooks"

/** All the scrapers that can be run. Scrapers are run in insertion order. */
const scrapers: {
  [K in FunctionName]?: K
} = {
  startBillBatches: "startBillBatches",
  startCityBatches: "startCityBatches",
  startCommitteeBatches: "startCommitteeBatches",
  startMemberBatches: "startMemberBatches",
  scrapeHearings: "scrapeHearings",
  scrapeSessions: "scrapeSessions",
  scrapeSpecialEvents: "scrapeSpecialEvents",
  updateCommitteeRosters: "updateCommitteeRosters",
  createMemberSearchIndex: "createMemberSearchIndex",
  updateBillReferences: "updateBillReferences"
}

const Args = z.object({
  interval: z.number().default(5),
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
    const remaining = Math.max(0, intervalMs - (performance.now() - start))
    if (remaining) {
      console.log(`pausing ${(remaining * 1e-3).toFixed(1)} s`)
      await new Promise(r => setTimeout(r, remaining))
    }
  }
}
