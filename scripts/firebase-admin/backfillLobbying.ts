/**
 * Backfill lobbying disclosure data from 2005 to the present.
 *
 * Delegates all HTTP fetching and Firestore writes to the Python scraper in
 * lobbying-scraper/. The TypeScript layer handles argument parsing and
 * environment setup only.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json \
 *     yarn firebase-admin run-script backfillLobbying --env dev
 *
 * Options (passed through to scrape.py):
 *   --year  NUMBER   Only process this year
 *   --limit NUMBER   Max registrants per year (for testing)
 *
 * Requires: pip install -r lobbying-scraper/requirements.txt
 * Or run inside the maple-2025 conda environment.
 */

import { spawn } from "child_process"
import path from "path"
import { z } from "zod"
import { Script } from "./types"

const Args = z
  .object({
    year: z.number().int().min(2005).optional(),
    limit: z.number().int().positive().optional()
  })
  .passthrough()

const SCRAPER = path.resolve(__dirname, "../../lobbying-scraper/scrape.py")

export const script: Script = async ({ env, args }) => {
  const { year, limit } = Args.parse(args)

  if (env === "local") {
    throw new Error(
      "backfillLobbying requires --env dev or --env prod " +
        "(it writes to a real Firestore project; local emulator not supported yet)"
    )
  }

  const pyArgs = ["--mode", "backfill"]
  if (year) pyArgs.push("--year", String(year))
  if (limit) pyArgs.push("--limit", String(limit))

  console.log(`Running: python3 ${SCRAPER} ${pyArgs.join(" ")}`)
  console.log(
    `Firestore project: ${process.env.GCLOUD_PROJECT || "(from ADC)"}`
  )

  await new Promise<void>((resolve, reject) => {
    const proc = spawn("python3", [SCRAPER, ...pyArgs], {
      stdio: ["ignore", "inherit", "inherit"],
      env: { ...process.env }
    })
    proc.on("close", code => {
      if (code === 0) resolve()
      else reject(new Error(`scrape.py exited with code ${code}`))
    })
    proc.on("error", reject)
  })
}
