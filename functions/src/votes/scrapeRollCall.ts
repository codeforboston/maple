import pdfParse from "pdf-parse"
import { RollCallResponse } from "./types"
import { db } from "../firebase"
import { timeZone } from "../malegislature"
import { DateTime } from "luxon"

type HouseRollCallVote = {
  lastName: string
  initial: string | null
  vote: RollCallResponse
  afterVote: boolean
  highlighted: boolean
}

function parseTime(timeStr: string): Date {
  const time = DateTime.fromFormat(timeStr, "M/d/yyyy h:mm a", {
    zone: timeZone
  })

  if (!time.isValid) {
    throw new Error(`Invalid date/time: ${time.invalidExplanation}`)
  }

  return time.toJSDate()
}

function parseVote(
  nameLine: string,
  statusLine: string
): HouseRollCallVote | string {
  let entry = {
    afterVote: false,
    highlighted: false
  }
  if (nameLine[nameLine.length - 1] == "*") {
    entry.afterVote = true
    nameLine = nameLine.slice(0, -1).trimEnd()
  }
  if (/^--.*--$/.test(nameLine)) {
    nameLine = nameLine.slice(2, -2).trim()
    entry.highlighted = true
  }

  let initial
  let lastName
  const nameMatch = nameLine.match(/^([^,]*),? ([a-zA-Z])\.$/)
  if (nameMatch !== null) {
    initial = nameMatch[2]
    lastName = nameMatch[1]
  } else {
    initial = null
    lastName = nameLine
  }

  let vote: RollCallResponse
  if (statusLine === "Y") {
    vote = "Yea"
  } else if (statusLine === "N") {
    vote = "Nay"
  } else if (statusLine === "X") {
    vote = "Abstain"
  } else {
    return `${statusLine} could not be understood as a vote`
  }

  return { vote, lastName, initial, ...entry }
}

type RollCall = {
  votes: HouseRollCallVote[]
  bill: string | null
  question: string
  yeas: number
  nays: number
  time: Date
  abstains: number
}
export type HouseRollCallResult = RollCall & { downloadUrl: string }

function parseQuestion(number: number, input: string) {
  const trim1 = "MASSACHUSETTS HOUSE OF REPRESENTATIVES"
  const trim2 = "Yea and Nay"
  const trim3 = `No. ${number}`
  if (!input.includes(trim1)) {
    return "Could not find MASSACHUSETTS HOUSE OF REPRESENTATIVES."
  }
  if (!input.includes(trim2)) {
    return "Could not find Yea and Nay."
  }
  if (!input.includes(trim3)) {
    return `Could not find ${trim3}.`
  }
  input = input.replace(trim1, " ").replace(trim2, " ").replace(trim3, " ")

  const search1 = /([0-9]+\/[0-9]+\/[0-9]+ [0-9]+:[0-9]+ (AM|PM))/
  const search2 = /([0-9]+) YEAS([0-9]+) NAYS([0-9]+) N\/V/
  const search3 = /H\. ([0-9]+)/

  // Find all required values
  const timeMatch = input.match(search1)
  const voteMatch = input.match(search2)
  const billMatch = input.match(search3)

  // Make sure every required value was found
  if (!timeMatch) {
    return "Could not find the date/time."
  }

  if (!voteMatch) {
    return "Could not find the Yea/Nay vote counts."
  }

  // Extract the values
  const timeStr = timeMatch[1]
  const yeas = Number(voteMatch[1])
  const nays = Number(voteMatch[2])
  const nv = Number(voteMatch[3])
  const billNumber = billMatch?.[1] ?? null

  // Remove everything we've extracted
  let question = input
    .replace(search1, "")
    .replace(search2, "")
    .replace(search3, "")
    .replace(/\s+/g, " ")
    .trim()

  return {
    question,
    timeStr,
    billNumber,
    yeas,
    nays,
    nv
  }
}

function parseVotes(number: number, text: string): RollCall | string {
  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
  const untilFirstVote = lines.findIndex(
    line => line == "Y" || line == "N" || line == "X"
  )
  const lastIntroLine = untilFirstVote - 2

  const result = parseQuestion(
    number,
    lines.slice(0, lastIntroLine + 1).join(" ")
  )
  if (typeof result === "string") {
    return result
  }
  const { question, timeStr, billNumber, yeas, nays, nv } = result
  const time = parseTime(timeStr)

  const results = []
  for (let i = untilFirstVote - 1; i < lines.length; i += 2) {
    let nameLine = lines[i]
    const statusLine = lines[i + 1]

    if (statusLine === undefined) {
      break
    }

    const thisVote = parseVote(nameLine, statusLine)
    if (typeof thisVote === "string") {
      return thisVote
    }
    results.push(thisVote)
  }

  const bill = billNumber ? `H${billNumber}` : null
  return {
    votes: results,
    bill,
    question,
    time,
    yeas: Number(yeas),
    nays: Number(nays),
    abstains: Number(nv)
  }
}

function downloadUrl(court: number, number: number): string {
  return `https://malegislature.gov/RollCall/${court}/HouseRollCall${number}.pdf`
}

export async function getHouseRollCall(
  court: number,
  number: number
): Promise<HouseRollCallResult | string | null> {
  const url = downloadUrl(court, number)
  const pdf = await fetch(url)
  if (pdf.status === 404) {
    return null
  }
  const result = await pdfParse(Buffer.from(await pdf.arrayBuffer()))
  const votes = parseVotes(number, result.text)
  if (typeof votes === "string") {
    return votes
  }
  return { downloadUrl: url, ...votes }
}

// Used to collect senate legislator ids
export async function getSenateLegislators(
  court: number
): Promise<Set<string>> {
  const snapshot = await db.collection(`generalCourts/${court}/members`).get()

  const result: Set<string> = new Set()
  for (const doc of snapshot.docs) {
    const data = doc.data()
    if (data.content.Branch === "Senate") {
      result.add(data.id)
    }
  }
  return result
}

// Used to cross-reference legislator names to ids
// Returns a [legislator name as present on pdfs, legislator id][] | error
export async function getHouseLegislators(
  court: number
): Promise<[string, string][] | string> {
  const snapshot = await db.collection(`generalCourts/${court}/members`).get()

  const result = []
  for (const doc of snapshot.docs) {
    const data = doc.data()
    if (data.content.Branch === "House") {
      // Cut off affixes (Jr., III)
      const match = data.content.Name.match(/^(.*), [^\s]+$/)
      let name: string = data.content.Name
      if (match !== null) {
        name = match[1]
      }
      if (data.content.LeadershipPosition === "Speaker of the House") {
        name = "The Speaker"
      }
      result.push([name, data.id] as [string, string])
    }
  }
  return result
}

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ʼʻ’‘ꞌˈ′ʹ՚]/g, "'")
}

// Arguments:
// [first initial | null, last name][]
// [legislator name from database, legislator id][]
// Returns:
// corresponding legislator id for each item in argument 1[] | error
export function translateNames(
  searching: [string | null, string][],
  legislatorNames: [string, string][]
): string[] | string {
  const searchMap = new Map()
  let i = 0
  for (let [initial, lastName] of searching) {
    lastName = normalize(lastName)
    // Normalize Mr., Mrs. Speaker
    if (lastName.endsWith(" Speaker")) {
      lastName = "The Speaker"
    }
    searchMap.set(`${initial}, ${lastName}`, i)
    i += 1
  }

  const translations = new Array(searching.length)
  let j = 0
  for (let [name, id] of legislatorNames) {
    name = normalize(name)
    const initial = name[0]
    for (let i = name.length - 1; i >= -1; i--) {
      if (i === -1 || name[i] === " ") {
        const namePart = name.slice(i + 1)
        const getInitial = searchMap.get(`${initial}, ${namePart}`)
        if (getInitial !== undefined) {
          translations[getInitial] = id
          j += 1
          break
        }
        const getNoInitial = searchMap.get(`null, ${namePart}`)
        if (getNoInitial !== undefined) {
          translations[getNoInitial] = id
          j += 1
          break
        }
      }
    }
  }
  if (j !== searching.length) {
    const missing = []
    for (let i = 0; i < searching.length; i++) {
      if (!translations[i]) {
        missing.push(searching[i])
      }
    }
    return `couldn't find all legislators (${JSON.stringify(
      missing
    )} remaining)`
  }
  return translations
}
