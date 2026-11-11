import { z } from "zod"
import { Script } from "./types"
import { courtList, parseArgs } from "./args"
import {
  matchMembersForCourt,
  NoMembersError
} from "functions/src/ocpf/matchOcpfMembers"

const Args = z.object({
  courts: courtList,
  // Print matchMembersForCourt's detailed logs (download info, OCPF headers,
  // per-member match warnings)
  verbose: z.boolean().default(false)
})

export const script: Script = async ({ args }) => {
  const { courts, verbose } = parseArgs(Args, args)

  const succeeded: number[] = []
  const failed: number[] = []

  for (const court of courts) {
    console.log(`\n── Court ${court} ──`)
    try {
      const { matched, unmatched, ambiguous } = await matchMembersForCourt(
        court,
        { quiet: !verbose }
      )

      // Same shape as the matchOcpfMembers HTTP response
      console.log(
        JSON.stringify(
          {
            results: {
              matched,
              unmatched: unmatched.length,
              ambiguous: ambiguous.length
            },
            unmatched_members: unmatched,
            ambiguous_members: ambiguous
          },
          null,
          2
        )
      )
      succeeded.push(court)
    } catch (err) {
      // Expected for a bad court number, so skip the stack trace
      if (err instanceof NoMembersError)
        console.error(`Court ${court} failed: ${err}`)
      else console.error(`Court ${court} failed:`, err)
      failed.push(court)
    }
  }

  console.log("\n── Summary ──")
  console.log(`Succeeded: ${succeeded.join(", ") || "none"}`)
  console.log(`Failed: ${failed.join(", ") || "none"}`)
}
