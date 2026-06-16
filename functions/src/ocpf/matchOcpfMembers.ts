import * as functions from "firebase-functions"
import { getAuth } from "firebase-admin/auth"
import axios from "axios"
import unzipper from "unzipper"
import { db } from "../firebase"
import { currentGeneralCourt } from "../shared"
import { MemberContent } from "../members/types"
import {
  OcpfFilerRow,
  OcpfMemberMapping,
  OcpfMemberMappingEntry,
  OcpfMemberMappingFlags,
  OcpfMemberMappingFlagsEntry
} from "./types"

// TODO: Convert to onCall once tested. Use checkAuth(context) + checkAdmin(context)
// from ../common.ts — both utilities handle admin role checking automatically.
export const matchOcpfMembers = functions.https.onRequest(async (req, res) => {
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

  const filers = await downloadAndParseFilers()
  const members = await loadMembers()

  const existingMappingDoc = await db.doc("/config/ocpfMemberMapping").get()
  const existingMapping = (existingMappingDoc.data() ?? {}) as OcpfMemberMapping

  const mapping: OcpfMemberMapping = {}
  const unmatched: OcpfMemberMappingFlagsEntry[] = []
  const ambiguous: OcpfMemberMappingFlagsEntry[] = []

  for (const member of members) {
    const lastName = extractLastName(member.Name)
    const branch = member.Branch

    if (!branch || (branch !== "Senate" && branch !== "House")) continue

    const lastNameMatches = filers.filter(
      f =>
        f.lastName.toLowerCase() === lastName.toLowerCase() &&
        f.officeSought === branch
    )

    // Narrow by first name: compare first word of each (e.g. "Daniel" from "Daniel J. Ryan"
    // vs "Daniel" from "Daniel Joseph"). Falls back to all last-name matches if none align.
    const mapleFirstName = member.Name.trim().split(/\s+/)[0].toLowerCase()
    const firstNameMatches = lastNameMatches.filter(
      f => f.firstName.trim().split(/\s+/)[0].toLowerCase() === mapleFirstName
    )
    const candidates =
      firstNameMatches.length > 0 ? firstNameMatches : lastNameMatches

    if (candidates.length === 1) {
      if (firstNameMatches.length === 0) {
        functions.logger.warn("Last name matched but first name did not align", {
          memberCode: member.MemberCode,
          name: member.Name,
          district: member.District,
          branch,
          ocpfFirstName: candidates[0].firstName,
          ocpfLastName: candidates[0].lastName
        })
      }
      const entry: OcpfMemberMappingEntry = {
        cpfId: candidates[0].cpfId,
        name: member.Name
      }
      mapping[member.MemberCode] = entry
    } else if (candidates.length === 0) {
      if (member.MemberCode in existingMapping) continue
      unmatched.push({ memberCode: member.MemberCode, name: member.Name })
      functions.logger.warn("No OCPF match", {
        memberCode: member.MemberCode,
        name: member.Name,
        district: member.District,
        branch
      })
    } else {
      if (member.MemberCode in existingMapping) continue
      ambiguous.push({ memberCode: member.MemberCode, name: member.Name })
      functions.logger.warn("Ambiguous OCPF match", {
        memberCode: member.MemberCode,
        name: member.Name,
        district: member.District,
        branch,
        candidates: candidates.map(c => ({
          cpfId: c.cpfId,
          firstName: c.firstName,
          lastName: c.lastName,
          district: c.district
        }))
      })
    }
  }

  const flags: OcpfMemberMappingFlags = { unmatched, ambiguous }

  await db.doc("/config/ocpfMemberMapping").set(mapping, { merge: true })
  await db.doc("/config/ocpfMemberMappingFlags").set(flags)

  functions.logger.info("matchOcpfMembers complete", {
    matched: Object.keys(mapping).length,
    unmatched: unmatched.length,
    ambiguous: ambiguous.length
  })

  res.status(200).json({
    results: {
      matched: Object.keys(mapping).length,
      unmatched: unmatched.length,
      ambiguous: ambiguous.length
    },
    unmatched_members: unmatched,
    ambiguous_members: ambiguous
  })
})

async function downloadAndParseFilers(): Promise<OcpfFilerRow[]> {
  const response = await axios.get(
    "https://ocpf2.blob.core.windows.net/downloads/data2/ocpf-filers.zip",
    { responseType: "arraybuffer" }
  )

  const buffer = Buffer.from(response.data as ArrayBuffer)
  functions.logger.info("Downloaded ocpf-filers.zip", {
    status: response.status,
    contentType: response.headers["content-type"],
    bytes: buffer.length,
    firstBytes: buffer.subarray(0, 4).toString("hex") // should be 504b0304 for a valid ZIP
  })
  const directory = await unzipper.Open.buffer(buffer)
  const entry = directory.files.find(
    f => f.type === "File" && f.path.toLowerCase().endsWith(".txt")
  )
  if (!entry) throw new Error("No .txt file found inside ocpf-filers.zip")

  const content = await entry.buffer()
  const text = content.toString("utf8")
  const lines = text.split(/\r?\n/)

  const rawHeaders = lines[0].split("\t").map(h => h.trim())
  functions.logger.info("OCPF filers headers", { headers: rawHeaders })

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

    if (closedDate !== "") continue
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

  functions.logger.info("Parsed active state legislators from OCPF", {
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

const GENERATIONAL_SUFFIXES = new Set(["jr", "sr", "ii", "iii", "iv", "v"])

function extractLastName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  while (parts.length > 1) {
    const last = parts[parts.length - 1].toLowerCase().replace(/[.,]/g, "")
    if (GENERATIONAL_SUFFIXES.has(last)) parts.pop()
    else break
  }
  return parts[parts.length - 1].replace(/[,.]$/, "")
}

async function loadMembers(): Promise<MemberContent[]> {
  const snapshot = await db
    .collection(`/generalCourts/${currentGeneralCourt}/members`)
    .get()

  return snapshot.docs
    .map(doc => {
      const data = doc.data()
      return data?.content as MemberContent | undefined
    })
    .filter((c): c is MemberContent => !!c)
}
