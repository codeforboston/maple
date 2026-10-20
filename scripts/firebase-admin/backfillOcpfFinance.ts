import { z } from "zod"
import { Script } from "./types"
import { parseArgs } from "./args"
import { scrapeFinanceForCourt } from "functions/src/ocpf/scrapeOcpfFinance"

const Args = z.object({
  // yargs parses a single value like "193" as a number
  courts: z
    .union([z.string(), z.number()])
    .transform(v => String(v).split(",").map(Number))
    .pipe(z.array(z.number().int().positive()))
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
