import { Number, Record, String } from "runtypes"
import { Script } from "./types"

/**
 * Pulls named real bills into the emulator by queuing a scraper batch; the
 * functions emulator's fetchBillBatch does the fetching and writing, so local
 * data has exactly the shape a scrape gives it. Local only: against a real
 * project the scraper schedules its own batches.
 *
 *   yarn firebase-admin run-script fetchBills --env local --court 194 --bills "S3141 H5630"
 */
const Args = Record({ court: Number, bills: String })

export const script: Script = async ({ env, db, args }) => {
  if (env !== "local") throw Error("only local supported")
  const { court, bills } = Args.check(args)
  const ids = bills.split(/\s+/).filter(Boolean)
  const batch = await db
    .collection("/scrapers/bills/batches")
    .add({ court, ids })
  console.log(
    `queued ${ids.length} bill(s) as scrapers/bills/batches/${batch.id}; watch the functions emulator log`
  )
}
