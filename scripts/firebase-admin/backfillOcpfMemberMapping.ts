import { z } from "zod"
import { Script } from "./types"
import { courtList, parseArgs } from "./args"
import { matchMembersForCourt } from "functions/src/ocpf/matchOcpfMembers"

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
      const { matched, unmatched, ambiguous } = await matchMembersForCourt(
        court
      )

      console.log(
        `Court ${court}: matched ${matched}, unmatched ${unmatched.length}, ambiguous ${ambiguous.length}`
      )
      if (unmatched.length > 0) {
        console.log(
          "  unmatched:",
          unmatched.map(m => `${m.memberCode} (${m.name})`).join(", ")
        )
      }
      if (ambiguous.length > 0) {
        console.log(
          "  ambiguous:",
          ambiguous.map(m => `${m.memberCode} (${m.name})`).join(", ")
        )
      }
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
