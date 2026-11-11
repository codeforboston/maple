import { z } from "zod"
import { Script } from "./types"
import { parseArgs } from "./args"
import { MemberContent } from "functions/src/members/types"
import {
  OcpfMemberMapping,
  OcpfMemberMappingEntry,
  OcpfMemberMappingFlags,
  OcpfMemberMappingFlagsEntry
} from "functions/src/ocpf/types"

// Manually maps one MAPLE member to their OCPF filer, for members that
// matchMembersForCourt flagged as unmatched or ambiguous. The entry is written
// with manual: true so later matcher runs leave it alone, and the member is
// removed from the court's flags doc.
//
// yarn firebase-admin run-script setOcpfMemberMapping --env dev \
//   --court 194 --memberCode SND1 --cpfId 15031

// yargs parses numeric values like "194" as numbers, and a flag given with no
// value as true
const stringOrNumber = z.union([z.string(), z.number()], {
  errorMap: (_, ctx) => ({
    message: ctx.data === undefined ? "required" : "requires a value"
  })
})

const positiveInt = stringOrNumber.pipe(
  z.coerce
    .number({ invalid_type_error: "must be a number" })
    .int("must be a whole number")
    .positive("must be greater than 0")
)

const Args = z.object({
  court: positiveInt,
  memberCode: stringOrNumber.pipe(
    z.coerce.string().trim().min(1, "requires a value")
  ),
  cpfId: positiveInt
})

export const script: Script = async ({ db, args }) => {
  const { court, memberCode, cpfId } = parseArgs(Args, args)

  const memberPath = `/generalCourts/${court}/members/${memberCode}`
  const mappingPath = `/generalCourts/${court}/ocpfMemberMappingConfig/ocpfMemberMapping`
  const flagsPath = `/generalCourts/${court}/ocpfMemberMappingConfig/ocpfMemberMappingFlags`

  const result = await db.runTransaction(async tx => {
    const [memberDoc, mappingDoc, flagsDoc] = await Promise.all([
      tx.get(db.doc(memberPath)),
      tx.get(db.doc(mappingPath)),
      tx.get(db.doc(flagsPath))
    ])

    const member = memberDoc.data()?.content as MemberContent | undefined
    if (!member) return { found: false as const }

    const previous = (mappingDoc.data() as OcpfMemberMapping | undefined)?.[
      memberCode
    ]
    const entry: OcpfMemberMappingEntry = {
      cpfId,
      name: member.Name,
      manual: true
    }
    tx.set(db.doc(mappingPath), { [memberCode]: entry }, { merge: true })

    const flags = flagsDoc.data() as OcpfMemberMappingFlags | undefined
    const removedFrom: string[] = []
    if (flags) {
      const without = (list: OcpfMemberMappingFlagsEntry[], name: string) => {
        const kept = list.filter(f => f.memberCode !== memberCode)
        if (kept.length !== list.length) removedFrom.push(name)
        return kept
      }
      const updated: OcpfMemberMappingFlags = {
        unmatched: without(flags.unmatched ?? [], "unmatched"),
        ambiguous: without(flags.ambiguous ?? [], "ambiguous")
      }
      if (removedFrom.length) tx.set(db.doc(flagsPath), updated)
    }

    return { found: true as const, entry, previous, removedFrom }
  })

  if (!result.found) {
    console.error(
      `No member ${memberCode} in court ${court} (${memberPath}). Nothing written.`
    )
    process.exitCode = 1
    return
  }

  console.log(
    JSON.stringify(
      {
        court,
        memberCode,
        previous: result.previous ?? null,
        written: result.entry,
        removedFromFlags: result.removedFrom
      },
      null,
      2
    )
  )
}
