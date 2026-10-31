/*
  Generates missing summaries and topics for bills and writes a CSV report
  (bill_id,status,summary,topics). Bills that already have a summary or topics
  keep them. Needs the OPENAI_API_KEY environment variable.

  Options:
    --court 194            general court to backfill (default 194)
    --bill-ids "H1,S2"     only these bills (comma or space separated)
    --dry-run              generate and report, but write nothing to Firestore
    --output ./file.csv    report path (default ./summaries-and-topics.csv)
*/
import { writeFileSync } from "fs"
import { z } from "zod"
import { backfillSummaries, parseBillIds, rowsToCsv } from "./backfillSummaries"
import { Script } from "./types"
import { parseArgs } from "./args"

const Args = z.object({
  court: z.coerce.number().int().positive().default(194),
  // yargs turns a lone numeric value into a number
  billIds: z.union([z.string(), z.number()]).transform(String).optional(),
  dryRun: z.boolean().default(false),
  output: z.string().default("./summaries-and-topics.csv")
})

export const script: Script = async ({ db, args }) => {
  const { court, billIds, dryRun, output } = parseArgs(Args, args)
  const rows = await backfillSummaries(db, {
    court,
    billIds: parseBillIds(billIds),
    dryRun
  })
  writeFileSync(output, rowsToCsv(rows))
  console.log(`wrote ${rows.length - 1} rows to ${output}`)
}
