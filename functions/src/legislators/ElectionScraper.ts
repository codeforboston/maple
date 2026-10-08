import type { MemoryOption } from "firebase-functions/v2"
import { onSchedule } from "firebase-functions/v2/scheduler"
import { db } from "../firebase"
import { fetchElectionsData } from "./scrapeElections"

export class ElectionScraper {
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

  private async run(yearTo?: number, yearFrom?: number) {
    const date = new Date()
    yearTo = yearTo ?? date.getFullYear()
    yearFrom = yearFrom ?? (date.getMonth() < 6 ? yearTo - 1 : yearTo)

    const list = await fetchElectionsData(yearFrom, yearTo)

    if (!list) return

    const writer = db.bulkWriter()

    for (let item of list) {
      const id = item.id
      writer.set(db.doc(`/electionResults/${id}`), item, { merge: true })
    }

    await writer.close()
  }
}

export const scrapeElections = new ElectionScraper().function
