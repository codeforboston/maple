import type { MemoryOption } from "firebase-functions/v2"
import { onSchedule } from "firebase-functions/v2/scheduler"
import { db } from "../firebase"
import {
  fetchSenateBillNumber,
  getHouseLegislators,
  getHouseRollCall,
  senateDownloadUrl,
  translateNames
} from "./scrapeRollCall"
import * as functions from "firebase-functions"
import { currentGeneralCourt } from "../shared"
import {
  RollCallVote,
  RollCallResponse,
  HouseRollCall,
  SenateRollCall,
  Branch,
  LegislativeMemberSummary
} from "./types"
import { BulkWriter, Timestamp } from "firebase-admin/firestore"
import { getRollCall, getRollCalls } from "../malegislature"
import {
  AddResult,
  ScrapeSummary,
  describeSummary,
  scrapeList,
  scrapeSequential
} from "./scrapeLoop"

/** Roll call numbers already stored for a court and branch. */
export async function getProcessedRollCalls(
  court: number,
  branch: Branch
): Promise<Set<number>> {
  const snapshot = await db
    .collection("votes")
    .where("type", "==", "RollCall")
    .where("branch", "==", branch)
    .where("generalCourtNumber", "==", court)
    .select("rollCallNumber")
    .get()
  return new Set(snapshot.docs.map(doc => doc.get("rollCallNumber")))
}

/** Runs `scrape` with a BulkWriter that is always flushed and closed. */
async function withWriter(
  scrape: (writer: BulkWriter) => Promise<ScrapeSummary>
): Promise<ScrapeSummary> {
  const writer = db.bulkWriter()
  try {
    return await scrape(writer)
  } finally {
    await writer.close()
  }
}

function logSummary(label: string, summary: ScrapeSummary) {
  const message = describeSummary(label, summary)
  if (summary.failed.length || summary.fatal) {
    functions.logger.error(message)
  } else {
    functions.logger.info(message)
  }
}

function httpStatus(e: unknown): number | undefined {
  return (e as { response?: { status?: number } })?.response?.status
}

export class SenateRollCallScraper {
  private schedule
  private timeout
  private memory

  constructor(
    schedule: string = "every 24 hours",
    timeout: number = 480,
    memory: MemoryOption = "256MiB"
  ) {
    this.schedule = schedule
    this.timeout = timeout
    this.memory = memory
  }

  get function() {
    return onSchedule(
      {
        schedule: this.schedule,
        timeoutSeconds: this.timeout,
        memory: this.memory,
        maxInstances: 1
      },
      () => this.run()
    )
  }

  async addRollCall(
    writer: BulkWriter,
    court: number,
    rollCallNumber: number
  ): Promise<AddResult> {
    let rollCall
    try {
      rollCall = await getRollCall(court, "Senate", rollCallNumber)
    } catch (e) {
      // The API answers 400 for a roll call number that doesn't exist.
      const status = httpStatus(e)
      if (status === 400 || status === 404) return { status: "missing" }
      return { status: "failed", reason: `fetch error: ${e}` }
    }
    const pdfURL = senateDownloadUrl(court, rollCallNumber)
    const bill = await fetchSenateBillNumber(pdfURL)
    const rollCallRewritten: SenateRollCall = {
      type: "RollCall",
      generalCourtNumber: court,
      branch: "Senate",
      bill,
      questionMotion: rollCall.QuestionMotion ?? null,
      downloadUrl:
        rollCall.DownloadUrl ??
        `http://malegislature.gov/api/DownloadRollCall?Branch=Senate&generalCourtNumber=${court}&rollCallNumber=${rollCallNumber}`,
      rollCallNumber
    }

    const docId = `senate-${court}-${rollCallNumber}`
    writer.set(db.collection("votes").doc(docId), rollCallRewritten)

    // In the Senate PDFs, members listed as absent appear under
    // "ABSENT OR NOT VOTING", so "Absent" is stored as the more general
    // "Not Voting".
    const groups: [LegislativeMemberSummary[] | undefined, RollCallResponse][] =
      [
        [rollCall.Yeas, "Yea"],
        [rollCall.Nays, "Nay"],
        [rollCall.Absent, "Not Voting"]
      ]
    for (const [members, response] of groups) {
      for (const member of members ?? []) {
        const memberCode = member?.MemberCode
        if (!memberCode) {
          continue
        }
        const voteRewritten: RollCallVote = {
          response,
          branch: "Senate",
          memberCode,
          generalCourtNumber: court,
          rollCallNumber
        }
        writer.set(
          db.collection(`votes/${docId}/vote`).doc(memberCode),
          voteRewritten
        )
      }
    }
    return { status: "added" }
  }

  /** Scrapes the given roll call numbers, replacing any stored copies. */
  scrapeNumbers(court: number, numbers: number[]): Promise<ScrapeSummary> {
    return withWriter(writer =>
      scrapeList(numbers, n => this.addRollCall(writer, court, n))
    )
  }

  /** Scrapes every roll call the API lists that isn't stored yet. */
  async scrapeNew(court: number): Promise<ScrapeSummary> {
    const listed = (await getRollCalls(court, "Senate")).map(
      r => r.RollCallNumber
    )
    const stored = await getProcessedRollCalls(court, "Senate")
    const todo = listed.filter(n => !stored.has(n)).sort((a, b) => a - b)
    return this.scrapeNumbers(court, todo)
  }

  private async run() {
    const summary = await this.scrapeNew(currentGeneralCourt)
    logSummary(`Senate roll calls, court ${currentGeneralCourt}`, summary)
  }
}

export class HouseRollCallScraper {
  private schedule
  private timeout
  private memory
  private legislators: Map<number, [string, string][]>

  constructor(
    schedule: string = "every 24 hours",
    timeout: number = 480,
    memory: MemoryOption = "256MiB"
  ) {
    this.schedule = schedule
    this.timeout = timeout
    this.memory = memory
    this.legislators = new Map()
  }

  get function() {
    return onSchedule(
      {
        schedule: this.schedule,
        timeoutSeconds: this.timeout,
        memory: this.memory,
        maxInstances: 1
      },
      () => this.run()
    )
  }

  private async loadLegislators(
    court: number
  ): Promise<[string, string][] | string> {
    const cached = this.legislators.get(court)
    if (cached) return cached
    const legislators = await getHouseLegislators(court)
    if (typeof legislators === "string") {
      return `error collecting legislators: ${legislators}`
    }
    if (!legislators.length) {
      return `no House legislators found in generalCourts/${court}/members`
    }
    this.legislators.set(court, legislators)
    return legislators
  }

  async addRollCall(
    writer: BulkWriter,
    court: number,
    rollCallNumber: number
  ): Promise<AddResult> {
    const legislators = await this.loadLegislators(court)
    if (typeof legislators === "string") {
      return { status: "fatal", reason: legislators }
    }
    const rollCall = await getHouseRollCall(court, rollCallNumber)
    if (!rollCall) {
      return { status: "missing" }
    }
    if (typeof rollCall === "string") {
      return { status: "failed", reason: rollCall }
    }
    const names = rollCall.votes.map(
      vote => [vote.initial, vote.lastName] as [string | null, string]
    )
    const ids = translateNames(names, legislators)
    // Check before writing anything, so a roll call is never stored
    // without its member votes.
    if (typeof ids === "string") {
      return { status: "failed", reason: `matching error: ${ids}` }
    }
    const rollcallRewritten: HouseRollCall = {
      type: "RollCall",
      rollCallNumber,
      generalCourtNumber: court,
      branch: "House",
      bill: rollCall.bill,
      time: Timestamp.fromDate(rollCall.time),
      questionMotion: rollCall.question,
      downloadUrl: rollCall.downloadUrl
    }
    const docId = `house-${court}-${rollCallNumber}`
    writer.set(db.collection("votes").doc(docId), rollcallRewritten)
    for (let i = 0; i < rollCall.votes.length; i++) {
      const voteRewritten: RollCallVote = {
        response: rollCall.votes[i].vote,
        branch: "House",
        memberCode: ids[i],
        generalCourtNumber: court,
        rollCallNumber: rollCallNumber
      }
      writer.set(
        db.collection(`votes/${docId}/vote`).doc(ids[i]),
        voteRewritten
      )
    }
    return { status: "added" }
  }

  /** Scrapes the given roll call numbers, replacing any stored copies. */
  scrapeNumbers(court: number, numbers: number[]): Promise<ScrapeSummary> {
    return withWriter(writer =>
      scrapeList(numbers, n => this.addRollCall(writer, court, n))
    )
  }

  /**
   * Scrapes every roll call PDF that isn't stored yet. House numbering
   * starts at 0 and there is no list endpoint, so this walks upward until
   * several numbers in a row have no PDF.
   */
  async scrapeNew(court: number): Promise<ScrapeSummary> {
    const stored = await getProcessedRollCalls(court, "House")
    return withWriter(writer =>
      scrapeSequential(0, stored, n => this.addRollCall(writer, court, n))
    )
  }

  private async run() {
    const summary = await this.scrapeNew(currentGeneralCourt)
    logSummary(`House roll calls, court ${currentGeneralCourt}`, summary)
  }
}

export const scrapeHouseRollCalls = new HouseRollCallScraper().function
export const scrapeSenateRollCalls = new SenateRollCallScraper().function
