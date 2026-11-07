import { Literal, Number, Optional, Record, Union } from "runtypes"
import { Script } from "./types"
import {
  HouseRollCallScraper,
  SenateRollCallScraper
} from "functions/src/votes"
import { describeSummary } from "functions/src/votes/scrapeLoop"

/**
 * Backfills roll call votes into `votes`, using the same code as the daily
 * scrapers.
 *
 * Without --number, fills in every roll call not yet stored (Senate: every
 * number the API lists; House: from #0 until the PDFs run out):
 *
 *   yarn firebase-admin run-script backfillRollCalls --env dev --court 192 --endCourt 194
 *
 * With --number (and optionally --endNumber), re-scrapes exactly that range,
 * replacing stored copies. Use it to repair a roll call with missing votes:
 *
 *   yarn firebase-admin run-script backfillRollCalls --env dev --court 194 --branch Senate --number 238
 *
 * A missing or failed roll call is reported and skipped; it never stops the run.
 */
const Args = Record({
  court: Number,
  endCourt: Optional(Number),
  number: Optional(Number),
  endNumber: Optional(Number),
  branch: Optional(Union(Literal("House"), Literal("Senate")))
})

export const script: Script = async ({ args }) => {
  const { court, endCourt, number, endNumber, branch } = Args.check(args)
  const branches = branch ? [branch] : (["Senate", "House"] as const)
  const scrapers = {
    Senate: new SenateRollCallScraper(),
    House: new HouseRollCallScraper()
  }

  let failures = 0
  for (let c = court; c <= (endCourt ?? court); c++) {
    for (const b of branches) {
      const scraper = scrapers[b]
      let summary
      if (number === undefined) {
        summary = await scraper.scrapeNew(c)
      } else {
        const last = endNumber ?? number
        const numbers = Array.from(
          { length: last - number + 1 },
          (_, i) => number + i
        )
        summary = await scraper.scrapeNumbers(c, numbers)
      }
      console.log(describeSummary(`${b} ${c}`, summary))
      failures += summary.failed.length + (summary.fatal ? 1 : 0)
    }
  }
  if (failures) process.exitCode = 1
}
