import { onRequest as onRequestV2 } from "firebase-functions/v2/https"
import * as logger from "firebase-functions/logger"
import { getAuth } from "firebase-admin/auth"
import axios from "axios"
import unzipper from "unzipper"
import { db } from "../firebase"
import { currentGeneralCourt, extractLastName } from "../shared"
import { MemberContent } from "../members/types"
import {
  OcpfFilerRow,
  OcpfMemberMapping,
  OcpfMemberMappingEntry,
  OcpfMemberMappingFlags,
  OcpfMemberMappingFlagsEntry
} from "./types"

export const matchOcpfMembers = onRequestV2(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed. Use POST.")
    return
  }
  if (process.env.FUNCTIONS_EMULATOR !== "true") {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).send("Unauthorized")
      return
    }
    try {
      const decoded = await getAuth().verifyIdToken(authHeader.slice(7))
      if (decoded["role"] !== "admin") {
        res.status(403).send("Forbidden")
        return
      }
    } catch {
      res.status(401).send("Unauthorized")
      return
    }
  }

  const { matched, unmatched, ambiguous } = await matchMembersForCourt(
    currentGeneralCourt
  )

  res.status(200).json({
    results: {
      matched,
      unmatched: unmatched.length,
      ambiguous: ambiguous.length
    },
    unmatched_members: unmatched,
    ambiguous_members: ambiguous
  })
})

// Matches a general court's MAPLE members to their OCPF filer record by last
// name + branch, writing the result to that court's ocpfMemberMapping. The
// current court is matched against active filers only (OCPF Closed_Date
// empty); historical courts drop that filter.
// Pass quiet to suppress logging
// (e.g. when run from a CLI script that prints its own summary).

// NOTE: OCPF filer records reflect the filer's *current* name and office, so
// matching older courts can miss legislators whose record has changed since.
// Examples:
// - Chamber switch (House <-> Senate): branch is a hard filter, so they come
//   up unmatched for the earlier court.
// - Last name change (e.g. Alyson M. Sullivan in court 192 is now filed as
//   Alyson M. Sullivan-Almeida). Alyson M. Sullivan isn't found, so for court 192,
//   they come up unmatched, or ambiguous if others share the old last name.
// Expected for older courts, not a bug; fix these by hand in ocpfMemberMapping.

export async function matchMembersForCourt(
  court: number,
  { quiet = false }: { quiet?: boolean } = {}
): Promise<{
  matched: number
  unmatched: OcpfMemberMappingFlagsEntry[]
  ambiguous: OcpfMemberMappingFlagsEntry[]
}> {
  const log = quiet ? silentLogger : logger
  const activeFilersOnly = court === currentGeneralCourt

  const filers = await downloadAndParseFilers(activeFilersOnly, log)
  const members = await loadMembers(court)

  const mappingPath = `/generalCourts/${court}/ocpfMemberMappingConfig/ocpfMemberMapping`
  const flagsPath = `/generalCourts/${court}/ocpfMemberMappingConfig/ocpfMemberMappingFlags`

  const existingMappingDoc = await db.doc(mappingPath).get()
  const existingMapping = (existingMappingDoc.data() ?? {}) as OcpfMemberMapping

  const mapping: OcpfMemberMapping = {}
  const unmatched: OcpfMemberMappingFlagsEntry[] = []
  const ambiguous: OcpfMemberMappingFlagsEntry[] = []

  for (const member of members) {
    const lastName = extractLastName(member.Name)
    const branch = member.Branch

    if (!branch || (branch !== "Senate" && branch !== "House")) continue

    const lastNameAndBranchMatches = filers.filter(
      f =>
        f.lastName.toLowerCase() === lastName.toLowerCase() &&
        f.officeSought === branch
    )

    // Narrow by first name: compare first word of each (e.g. "Daniel" from "Daniel J. Ryan"
    // vs "Daniel" from "Daniel Joseph"). If none align, falls back to matches by last name and branch.
    const mapleFirstName = member.Name.trim().split(/\s+/)[0].toLowerCase()
    const firstNameMatches = lastNameAndBranchMatches.filter(
      f => f.firstName.trim().split(/\s+/)[0].toLowerCase() === mapleFirstName
    )
    const candidates =
      firstNameMatches.length > 0 ? firstNameMatches : lastNameAndBranchMatches

    if (firstNameMatches.length === 1) {
      const entry: OcpfMemberMappingEntry = {
        cpfId: candidates[0].cpfId,
        name: member.Name
      }
      mapping[member.MemberCode] = entry

      // Matching was likley fixed manually
    } else if (member.MemberCode in existingMapping) {
      continue

      // Single last name match but first name didn't align. Flag rather than auto-match,
      // since the OCPF filer may be a different person (e.g. original member changed office sought,
      // and another person with same last name is running for original office).
    } else if (candidates.length === 1 && firstNameMatches.length === 0) {
      ambiguous.push({ memberCode: member.MemberCode, name: member.Name })
      log.warn(
        "Ambiguous OCPF match. Single last name match but first name did not align.",
        {
          court,
          memberCode: member.MemberCode,
          name: member.Name,
          district: member.District,
          branch,
          ocpfFirstName: candidates[0].firstName,
          ocpfLastName: candidates[0].lastName,
          ocpfDistrict: candidates[0].district,
          ocpfOfficeSought: candidates[0].officeSought
        }
      )
    } else if (candidates.length === 0) {
      unmatched.push({ memberCode: member.MemberCode, name: member.Name })
      log.warn("No OCPF match.", {
        court,
        memberCode: member.MemberCode,
        name: member.Name,
        district: member.District,
        branch
      })
    } else {
      ambiguous.push({ memberCode: member.MemberCode, name: member.Name })
      log.warn("Ambiguous OCPF match.", {
        court,
        memberCode: member.MemberCode,
        name: member.Name,
        district: member.District,
        branch,
        candidates: candidates.map(c => ({
          cpfId: c.cpfId,
          firstName: c.firstName,
          lastName: c.lastName,
          district: c.district,
          officeSought: c.officeSought
        }))
      })
    }
  }

  const flags: OcpfMemberMappingFlags = { unmatched, ambiguous }

  await db.doc(mappingPath).set(mapping, { merge: true })
  await db.doc(flagsPath).set(flags)

  const matched = Object.keys(mapping).length
  log.info("matchOcpfMembers complete", {
    court,
    matched,
    unmatched: unmatched.length,
    ambiguous: ambiguous.length
  })

  return { matched, unmatched, ambiguous }
}

type Log = Pick<typeof logger, "info" | "warn">

const silentLogger: Log = { info: () => {}, warn: () => {} }

async function downloadAndParseFilers(
  activeFilersOnly: boolean,
  log: Log
): Promise<OcpfFilerRow[]> {
  const response = await axios.get(
    "https://ocpf2.blob.core.windows.net/downloads/data2/ocpf-filers.zip",
    { responseType: "arraybuffer" }
  )

  const buffer = Buffer.from(response.data as ArrayBuffer)
  log.info("Downloaded ocpf-filers.zip", {
    status: response.status,
    contentType: response.headers["content-type"],
    bytes: buffer.length,
    firstBytes: buffer.subarray(0, 4).toString("hex") // should be 504b0304 for a valid ZIP
  })
  const directory = await unzipper.Open.buffer(buffer)

  // Using all_filers.txt to catch more edge cases. If want to filter out more ambiguity,
  // such as not including Z account types, we can switch to candidates.txt
  const entry = directory.files.find(
    f => f.type === "File" && f.path.toLowerCase() === "all_filers.txt"
  )
  if (!entry)
    throw new Error("No all_filers.txt file found inside ocpf-filers.zip")

  const content = await entry.buffer()
  const text = content.toString("utf8")
  const lines = text.split(/\r?\n/)

  const rawHeaders = lines[0].split("\t").map(h => h.trim())
  log.info("OCPF filers headers", { headers: rawHeaders })

  const colIndex = buildColumnIndex(rawHeaders, [
    "cpfId",
    "lastName",
    "firstName",
    "officeSought",
    "district",
    "closedDate"
  ])

  // Values in the file are wrapped in double quotes — strip them after splitting
  const col = (cols: string[], idx: number) =>
    (cols[idx] ?? "").trim().replace(/^"|"$/g, "")

  const filers: OcpfFilerRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    const cols = line.split("\t")
    const closedDate = col(cols, colIndex.closedDate)
    const officeSought = col(cols, colIndex.officeSought)

    if (activeFilersOnly && closedDate !== "") continue
    if (officeSought !== "Senate" && officeSought !== "House") continue

    filers.push({
      cpfId: parseInt(col(cols, colIndex.cpfId), 10),
      lastName: col(cols, colIndex.lastName),
      firstName: col(cols, colIndex.firstName),
      officeSought,
      district: col(cols, colIndex.district),
      closedDate
    })
  }

  log.info("Parsed active state legislators from OCPF", {
    count: filers.length
  })
  return filers
}

const COLUMN_ALIASES: Record<string, string[]> = {
  cpfId: ["cpf_id"],
  lastName: ["candidate_last_name"],
  firstName: ["candidate_first_name"],
  officeSought: ["office_type_sought"],
  district: ["district_name_sought"],
  closedDate: ["closed_date"]
}

function buildColumnIndex(
  headers: string[],
  fields: string[]
): Record<string, number> {
  const normalized = headers.map(h => h.toLowerCase().replace(/\s+/g, "_"))
  const index: Record<string, number> = {}

  for (const field of fields) {
    const aliases = COLUMN_ALIASES[field] ?? [field.toLowerCase()]
    const found = aliases.findIndex(alias =>
      normalized.some((h, i) => {
        if (h === alias) {
          index[field] = i
          return true
        }
        return false
      })
    )
    if (found === -1 && !(field in index)) {
      throw new Error(
        `Required column '${field}' not found in OCPF filers file. ` +
          `Headers: ${headers.join(", ")}`
      )
    }
  }

  return index
}

async function loadMembers(court: number): Promise<MemberContent[]> {
  const snapshot = await db.collection(`/generalCourts/${court}/members`).get()

  return snapshot.docs
    .map(doc => {
      const data = doc.data()
      return data?.content as MemberContent | undefined
    })
    .filter((c): c is MemberContent => !!c)
}
