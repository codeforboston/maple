import { Number as RNumber, Record, String as RString, Union } from "runtypes"
import { Script } from "./types"
import { scrapeFinanceForCourt } from "functions/src/ocpf/scrapeOcpfFinance"

// yargs parses a single value like "193" as a number
const Args = Record({ courts: Union(RString, RNumber) })

export const script: Script = async ({ args }) => {
  const { courts } = Args.check(args)
  const courtNumbers = String(courts).split(",").map(Number)

  const succeeded: number[] = []
  const failed: number[] = []

  for (const court of courtNumbers) {
    if (!Number.isInteger(court) || court <= 0) {
      console.error(`Skipping invalid court number: ${court}`)
      failed.push(court)
      continue
    }

    console.log(`\n── Court ${court} ──`)
    try {
      const { processed, years } = await scrapeFinanceForCourt(court)
      console.log(
        `Court ${court}: processed ${processed} members for years ${years.join(
          ", "
        )}`
      )
      succeeded.push(court)
    } catch (err) {
      console.error(`Court ${court} failed:`, err)
      failed.push(court)
    }
  }

  console.log("\n── Summary ──")
  console.log(`Succeeded: ${succeeded.join(", ") || "none"}`)
  console.log(`Failed: ${failed.join(", ") || "none"}`)
}
