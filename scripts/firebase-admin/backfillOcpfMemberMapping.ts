import { Record, String } from "runtypes"
import { Script } from "./types"
import { matchMembersForCourt } from "functions/src/ocpf/matchOcpfMembers"

const Args = Record({ courts: String })

export const script: Script = async ({ args }) => {
  const { courts } = Args.check(args)
  const courtNumbers = courts.split(",").map(Number)

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
