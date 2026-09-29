import { runWith, RuntimeOptions } from "firebase-functions"
import { db } from "../firebase"
import {
  getHouseLegislators,
  getHouseRollCall,
  translateNames
} from "./scrapeRollCall"
import * as functions from "firebase-functions"
import { currentGeneralCourt } from "../shared"
import { RollCallVote, HouseRollCall } from "./types"
import { BulkWriter, Timestamp } from "firebase-admin/firestore"

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

    while ((this.legislators ?? []).length && rollcall === "success") {
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
