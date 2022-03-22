import { City } from "../cities/types"
import { Committee } from "../committees/types"
import { db } from "../firebase"
import * as api from "../malegislature"
import { Member } from "../members/types"
import { runWith } from "firebase-functions"
import { Bill } from "./types"
import { Runtype } from "runtypes"
import { QuerySnapshot } from "@google-cloud/firestore"

/** Base class for jobs that need to process all bills. */
export default abstract class BillProcessor {
  protected bills!: Bill[]
  protected committees!: Committee[]
  protected members!: Member[]
  protected cities!: City[]

  static for(
    Processor: { new (): BillProcessor },
    schedule = "every 24 hours",
    timeoutSeconds = 120
  ) {
    return runWith({ timeoutSeconds })
      .pubsub.schedule(schedule)
      .onRun(() => new Processor().run())
  }

  async run() {
    await this.readEntities()
    await this.process()
  }

  abstract process(): Promise<void>

  billPath(id?: string) {
    return `/generalCourts/${api.currentGeneralCourt}/bills${
      id ? `/${id}` : ""
    }`
  }

  private async readEntities() {
    this.bills = await db
      .collection(this.billPath())
      .get()
      .then(snap => snap.docs.map(d => Bill.checkWithDefaults(d.data())))
    this.cities = await db
      .collection(`/generalCourts/${api.currentGeneralCourt}/cities`)
      .get()
      .then(this.load(City))
    this.committees = await db
      .collection(`/generalCourts/${api.currentGeneralCourt}/committees`)
      .get()
      .then(this.load(Committee))
    this.members = await db
      .collection(`/generalCourts/${api.currentGeneralCourt}/members`)
      .get()
      .then(this.load(Member))
  }

  private load<T extends { id: string }>(Entity: Runtype<T>) {
    return (snap: QuerySnapshot) => snap.docs.map(d => Entity.check(d.data()))
  }
}
