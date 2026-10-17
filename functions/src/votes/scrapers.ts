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
import { RollCallVote, HouseRollCall, SenateRollCall, Branch } from "./types"
import { BulkWriter, Timestamp } from "firebase-admin/firestore"
import { getRollCall } from "../malegislature"

async function getHighestProcessedRollCall(branch: Branch): Promise<number> {
  const lastVote = await db
    .collection("votes")
    .where("type", "==", "RollCall")
    .where("branch", "==", branch)
    .where("generalCourtNumber", "==", currentGeneralCourt)
    .orderBy("rollCallNumber", "desc")
    .select("rollCallNumber")
    .limit(1)
    .get()

  // Roll call numbering starts at 1
  const number = lastVote.empty ? 0 : lastVote.docs[0].get("rollCallNumber")
  return number
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
  ): Promise<string> {
    let rollCall
    try {
      rollCall = await getRollCall(court, "Senate", rollCallNumber)
    } catch (e) {
      return `fetch error: ${e}`
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

    for (let i = 0; i < (rollCall.Yeas ?? []).length; i++) {
      const memberCode = rollCall?.Yeas?.[i]?.MemberCode
      if (!memberCode) {
        continue
      }
      const voteRewritten: RollCallVote = {
        response: "Yea",
        branch: "Senate",
        memberCode: memberCode!,
        generalCourtNumber: court,
        rollCallNumber
      }
      writer.set(
        db.collection(`votes/${docId}/vote`).doc(memberCode),
        voteRewritten
      )
    }
    for (let i = 0; i < (rollCall.Nays ?? []).length; i++) {
      const memberCode = rollCall?.Nays?.[i]?.MemberCode
      if (!memberCode) {
        continue
      }
      const voteRewritten: RollCallVote = {
        response: "Nay",
        branch: "Senate",
        memberCode: memberCode!,
        generalCourtNumber: court,
        rollCallNumber
      }
      writer.set(
        db.collection(`votes/${docId}/vote`).doc(memberCode),
        voteRewritten
      )
    }
    // The senate PDFs, members who are listed as absent
    // are listed in the section "ABSENT OR NOT VOTING",
    // so absent is switch to "Not Voting" (the more general
    // description) here.
    for (let i = 0; i < (rollCall.Absent ?? []).length; i++) {
      const memberCode = rollCall?.Absent?.[i]?.MemberCode
      if (!memberCode) {
        continue
      }
      const voteRewritten: RollCallVote = {
        response: "Not Voting",
        branch: "Senate",
        memberCode: memberCode!,
        generalCourtNumber: court,
        rollCallNumber
      }
      writer.set(
        db.collection(`votes/${docId}/vote`).doc(memberCode),
        voteRewritten
      )
    }
    return "success"
  }

  private async run() {
    let rollCallNumber = (await getHighestProcessedRollCall("Senate")) + 1

    const writer = db.bulkWriter()

    let rollcall = await this.addRollCall(
      writer,
      currentGeneralCourt,
      rollCallNumber
    )
    while (rollcall === "success") {
      rollCallNumber += 1

      rollcall = await this.addRollCall(
        writer,
        currentGeneralCourt,
        rollCallNumber
      )
    }

    await writer.close()

    if (!rollcall.startsWith("fetch error")) {
      functions.logger.error(
        `Error collecting house rollcall ${rollCallNumber}: ${rollcall}`
      )
    }
  }
}

export class HouseRollCallScraper {
  private schedule
  private timeout
  private memory
  private legislators: [string, string][] | null

  constructor(
    schedule: string = "every 24 hours",
    timeout: number = 480,
    memory: MemoryOption = "256MiB"
  ) {
    this.schedule = schedule
    this.timeout = timeout
    this.memory = memory
    this.legislators = null
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
  ): Promise<string> {
    if (!this.legislators) {
      const legislators = await getHouseLegislators(court)
      if (typeof legislators === "string") {
        this.legislators = []
        return `error collecting legislators: ${legislators}`
      } else {
        if (!legislators.length) {
          return `error no legislators found in database`
        }
        this.legislators = legislators
      }
    }
    if (this.legislators!.length === 0) {
      return "no legislators available"
    }
    const rollCall = await getHouseRollCall(court, rollCallNumber)
    if (!rollCall) {
      return "fetch error"
    }
    if (typeof rollCall === "string") {
      return rollCall
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
    const names = rollCall.votes.map(
      vote => [vote.initial, vote.lastName] as [string | null, string]
    )
    const ids = translateNames(names, this.legislators)
    if (typeof ids === "string") {
      return `matching error: ${ids}`
    }
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
    return "success"
  }

  private async run() {
    let rollCallNumber = await getHighestProcessedRollCall("House")

    const writer = db.bulkWriter()

    let rollcall = await this.addRollCall(
      writer,
      currentGeneralCourt,
      rollCallNumber
    )

    while ((this.legislators ?? []).length && rollcall === "success") {
      rollCallNumber += 1
      rollcall = await this.addRollCall(
        writer,
        currentGeneralCourt,
        rollCallNumber
      )
    }

    await writer.close()

    if (!rollcall.startsWith("fetch error")) {
      functions.logger.error(
        `Error collecting house rollcall ${rollCallNumber}: ${rollcall}`
      )
    }
  }
}

export const scrapeHouseRollCalls = new HouseRollCallScraper().function
export const scrapeSenateRollCalls = new SenateRollCallScraper().function
