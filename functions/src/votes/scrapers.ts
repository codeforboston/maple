import { runWith, RuntimeOptions } from "firebase-functions"
import { db } from "../firebase"
import {
  getHouseLegislators,
  getSenateLegislators,
  getHouseRollCall,
  translateNames
} from "./scrapeRollCall"
import * as functions from "firebase-functions"
import { currentGeneralCourt } from "../shared"
import { RollCallVote, HouseRollCall, SenateRollCall } from "./types"
import { BulkWriter, Timestamp } from "firebase-admin/firestore"
import { getRollCall } from "../malegislature"

export class SenateRollCallScraper {
  private schedule
  private timeout
  private memory
  private legislators: Set<string> | null

  constructor(
    schedule: string = "every 24 hours",
    timeout: number = 480,
    memory: RuntimeOptions["memory"] = "256MB"
  ) {
    this.schedule = schedule
    this.timeout = timeout
    this.memory = memory
    this.legislators = null
  }

  get function() {
    return runWith({
      timeoutSeconds: this.timeout,
      memory: this.memory,
      maxInstances: 1
    })
      .pubsub.schedule(this.schedule)
      .onRun(() => this.run())
  }

  async addRollCall(
    writer: BulkWriter,
    court: number,
    rollCallNumber: number
  ): Promise<string> {
    if (!this.legislators) {
      const legislators = await getSenateLegislators(court)
      if (typeof legislators === "string") {
        this.legislators = new Set()
        return `error collecting legislators: ${legislators}`
      } else {
        if (!legislators.size) {
          return `error no legislators found in database`
        }
        this.legislators = legislators
      }
    }
    if (this.legislators!.size < 40) {
      return `discovered senate legislature size is ${
        this.legislators!.size
      } (expected 40)`
    }

    let rollCall
    try {
      rollCall = await getRollCall(court, "Senate", rollCallNumber)
    } catch (e) {
      return `fetch error: ${e}`
    }
    const rollCallRewritten: SenateRollCall = {
      type: "RollCall",
      generalCourtNumber: court,
      branch: "Senate",
      questionMotion: rollCall.QuestionMotion ?? null,
      downloadUrl:
        rollCall.DownloadUrl ??
        `https://malegislature.gov/api/DownloadRollCall?Branch=House&generalCourtNumber=${court}&rollCallNumber=${rollCallNumber}`,
      rollCallNumber
    }

    const docId = `senate-${court}-${rollCallNumber}`
    writer.set(db.collection("votes").doc(docId), rollCallRewritten)

    const remainingMembers = new Set(this.legislators)
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
      remainingMembers.delete(memberCode)
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
      remainingMembers.delete(memberCode)
      writer.set(
        db.collection(`votes/${docId}/vote`).doc(memberCode),
        voteRewritten
      )
    }
    // This includes members that are only present for part of a session
    // (should be altered?)
    for (const memberCode of remainingMembers) {
      const voteRewritten: RollCallVote = {
        response: "Abstain",
        branch: "Senate",
        memberCode: memberCode,
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
    const snapshot = await db
      .collection("votes")
      .where("type", "==", "rollcall")
      .where("branch", "==", "Senate")
      .get()

    let rollCallNumber = 1
    for (const doc of snapshot.docs) {
      const name = doc.ref.id
      const thisCourt = Number(name.split("-")[1])
      const thisNumber = Number(name.split("-")[2])
      if (thisCourt === currentGeneralCourt && thisNumber > rollCallNumber) {
        rollCallNumber = thisNumber
      }
    }

    const writer = db.bulkWriter()

    let rollcall = await this.addRollCall(
      writer,
      currentGeneralCourt,
      rollCallNumber
    )
    while (!rollcall.startsWith("fetch error")) {
      rollCallNumber += 1
      if (rollcall !== "success") {
        functions.logger.error(
          `Error collecting senate rollcall ${rollCallNumber}: ${rollcall}`
        )
      }

      rollcall = await this.addRollCall(
        writer,
        currentGeneralCourt,
        rollCallNumber
      )
    }

    await writer.close()
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
    memory: RuntimeOptions["memory"] = "256MB"
  ) {
    this.schedule = schedule
    this.timeout = timeout
    this.memory = memory
    this.legislators = null
  }

  get function() {
    return runWith({
      timeoutSeconds: this.timeout,
      memory: this.memory,
      maxInstances: 1
    })
      .pubsub.schedule(this.schedule)
      .onRun(() => this.run())
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
    const snapshot = await db
      .collection("votes")
      .where("type", "==", "rollcall")
      .where("branch", "==", "House")
      .get()

    let rollCallNumber = 1
    for (const doc of snapshot.docs) {
      const name = doc.ref.id
      const thisCourt = Number(name.split("-")[1])
      const thisNumber = Number(name.split("-")[2])
      if (thisCourt === currentGeneralCourt && thisNumber > rollCallNumber) {
        rollCallNumber = thisNumber
      }
    }

    const writer = db.bulkWriter()

    let rollcall = await this.addRollCall(
      writer,
      currentGeneralCourt,
      rollCallNumber
    )
    // stop at 404
    while (!rollcall.startsWith("fetch error")) {
      rollCallNumber += 1
      if (rollcall !== "success") {
        functions.logger.error(
          `Error collecting house rollcall ${rollCallNumber}: ${rollcall}`
        )
      }
      rollcall = await this.addRollCall(
        writer,
        currentGeneralCourt,
        rollCallNumber
      )
    }

    await writer.close()
  }
}

export const scrapeHouseRollCalls = new HouseRollCallScraper().function
export const scrapeSenateRollCalls = new SenateRollCallScraper().function
