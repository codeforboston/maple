import { waitFor } from "@testing-library/react"
import axios from "axios"
import { currentGeneralCourt } from "functions/src/shared"
import { PartialTestimony } from "../../functions/src/bills/backfillTestimonyCounts"
import { terminateFirebase, testDb } from "../testUtils"
import { createFakeBill, getBill } from "./common"

const timeout = 10000
jest.setTimeout(timeout)

let billId: string
beforeEach(async () => {
  billId = await createFakeBill()
})

afterAll(terminateFirebase)

describe.skip("backfillTestimonyCounts", () => {
  it("Calculates testimony counts", async () => {
    await setPublication("user-1", "t-1", {
      position: "endorse",
      billId,
      court: currentGeneralCourt
    })
    await setPublication("user-2", "t-2", {
      position: "neutral",
      billId,
      court: currentGeneralCourt
    })
    await setPublication("user-3", "t-3", {
      position: "oppose",
      billId,
      court: currentGeneralCourt
    })
    await setPublication("user-4", "t-4", {
      position: "endorse",
      billId,
      court: currentGeneralCourt
    })

    await testDb
      .doc(`/generalCourts/${currentGeneralCourt}/bills/${billId}`)
      .update({
        testimonyCount: 0,
        endorseCount: 0,
        opposeCount: 0,
        neutralCount: 0
      })

    await triggerBackfill([billId])

    await waitFor(
      async () => {
        const bill = await getBill(billId)
        expect(bill.testimonyCount).toEqual(4)
        expect(bill.endorseCount).toEqual(2)
        expect(bill.neutralCount).toEqual(1)
        expect(bill.opposeCount).toEqual(1)
      },
      { timeout, interval: 500 }
    )
  })

  async function triggerBackfill(ids: string[]) {
    await axios({
      method: "GET",
      url: "http://localhost:5001/demo-dtp/us-central1/triggerPubsubFunction",
      params: {
        pubsub: "backfillTestimonyCounts",
        data: JSON.stringify({ run: true, billIds: ids })
      }
    })
  }
})

async function setPublication(
  uid: string,
  id: string,
  testimony: PartialTestimony
): Promise<void> {
  await testDb.doc(`/users/${uid}/publishedTestimony/${id}`).set(testimony)
}
