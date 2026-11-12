import * as fs from "fs"
import { DateTime } from "luxon"
import { z } from "zod"
import { sendConferenceLetters } from "../../functions/src/conferenceLetters/sendLetters"
import { compileWeeklyUpdates } from "../../functions/src/conferenceUpdates/compileWeeklyUpdates"
import { timeZone } from "../../functions/src/malegislature"
import { ArgsError } from "./args"
import { Script } from "./types"

/**
 * Runs a conference mail job once against the local emulators, as its schedule
 * would: `letters` (mailConferenceLetters, daily at 9:00) or `updates`
 * (compileConferenceUpdates, Mondays at 8:00). The emulators never fire
 * schedules. With no --now it is the job's next scheduled run, so letters
 * cover today's input and updates this week's. The emails land in /emails for
 * the send-email extension, addressed to LETTER_TEST_RECIPIENT, which is read
 * from the functions env files as the functions emulator reads it. Local only.
 *
 *   yarn firebase-admin run-script runConferenceMail --env local --job letters
 *   yarn firebase-admin run-script runConferenceMail --env local --job updates --now 2026-11-16T08:00
 */
const Args = z.object({
  job: z.enum(["letters", "updates"]),
  now: z.string().optional()
})

const ENV_FILES = [
  "functions/.env",
  "functions/.env.demo-dtp",
  "functions/.env.local"
]
const ENV_KEYS = [
  "LETTER_TEST_RECIPIENT",
  "LETTER_FROM",
  "CONFEREE_UPDATE_FROM"
]

/** The jobs read these in this process, not the emulator's, so load them the
 * same way: later files win, and the shell wins over all. */
const loadFunctionsEnv = () => {
  const values: Record<string, string> = {}
  for (const file of ENV_FILES.filter(f => fs.existsSync(f)))
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/)
      if (m && ENV_KEYS.includes(m[1])) values[m[1]] = m[2]
    }
  for (const [k, v] of Object.entries(values)) process.env[k] ??= v
}

const nextRun = (job: "letters" | "updates") => {
  const today = DateTime.now().setZone(timeZone).startOf("day")
  return job === "letters"
    ? today.plus({ days: 1 }).set({ hour: 9 })
    : today.startOf("week").plus({ weeks: 1 }).set({ hour: 8 })
}

export const script: Script = async ({ env, args }) => {
  if (env !== "local") throw Error("only local supported")
  const parsed = Args.safeParse(args)
  if (!parsed.success) throw new ArgsError(parsed.error.issues)
  const { job, now: nowArg } = parsed.data

  const now = nowArg
    ? DateTime.fromISO(nowArg, { zone: timeZone })
    : nextRun(job)
  if (!now.isValid) throw Error(`--now ${nowArg}: ${now.invalidExplanation}`)

  loadFunctionsEnv()
  const to = process.env.LETTER_TEST_RECIPIENT
  if (!to) throw Error("LETTER_TEST_RECIPIENT is unset, so nothing would send")

  console.log(`Running ${job} as of ${now.toISO()}, mailing ${to}`)
  if (job === "letters") await sendConferenceLetters(now.toJSDate())
  else await compileWeeklyUpdates(now.toJSDate())
  console.log(
    "Check /emails (delivery) and /conferenceLetterSkips in the emulator UI"
  )
}
