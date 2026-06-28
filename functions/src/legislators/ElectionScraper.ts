import { runWith, RuntimeOptions } from "firebase-functions"
import { db } from "../firebase"
import { electionId } from "./electionTypes"
import { fetchElectionsData } from "./scrapeElections"

export class ElectionScraper {
  private schedule
  private timeout
  private memory

  constructor(
    schedule: string = "every 24 hours",
    timeout: number = 480,
    memory: RuntimeOptions["memory"] = "256MB"
  ) {
    this.schedule = schedule
    this.timeout = timeout
    this.memory = memory
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

  private async run(yearTo?: number, yearFrom?: number) {
    const date = new Date()
    yearTo = yearTo ?? date.getFullYear()
    yearFrom = yearFrom ?? (date.getMonth() < 6 ? yearTo - 1 : yearTo)

    const list = await fetchElectionsData(yearFrom, yearTo)

    if (!list) return

    const writer = db.bulkWriter()

    for (let item of list) {
      const id = electionId(item)
      writer.set(db.doc(`/electionResults/${id}`), item, { merge: true })
    }

    await writer.close()
  }
}

export const scrapeElections = new ElectionScraper().function
