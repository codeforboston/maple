import { z } from "zod"
import { Script } from "./types"
import { courtList, parseArgs } from "./args"
import { scrapeFinanceForCourt } from "functions/src/ocpf/scrapeOcpfFinance"

const Args = z.object({
  courts: courtList
})

export const script: Script = async ({ args }) => {
  const { courts } = parseArgs(Args, args)

  const succeeded: number[] = []
  const failed: number[] = []

  for (const court of courts) {
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
