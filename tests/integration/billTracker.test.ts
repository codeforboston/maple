import { waitFor } from "@testing-library/react"
import { BillHistory } from "components/db"
import { billTrackerPath } from "functions/src/analysis"
import { predictBillStatus } from "functions/src/analysis/predictBillStatus"
import { BillTracker, Stage } from "functions/src/analysis/types"
import { nanoid } from "nanoid"
import { testDb, testTimestamp } from "tests/testUtils"
import { createNewBill } from "./common"

// yarn firebase-admin -e local run-script touchBills --court 192 --bills='H1011 H1225 H1035 H2147 H100'

// Bill with status "bill introduced"
// billid = any, no history
const noHistory: BillHistory = [{ Action: "", Branch: "", Date: "" }]

// bill with status "firstCommittee" -- billId = H1011
const firstCommitteeHistory: BillHistory = [
  {
    Action:
      "Referred to the committee on Environment, Natural Resources and Agriculture",
    Branch: "House",
    Date: "2021-03-29T14:50:09.363Z"
  },
  {
    Action: "Senate concurred",
    Branch: "Senate",
    Date: "2021-03-30T03:59:59.000Z"
  },
  {
    Action:
      "Hearing scheduled for 10/13/2021 from 02:00 PM-05:00 PM in Virtual Hearing",
    Branch: "Joint",
    Date: "2021-10-05T18:16:42.090Z"
  }
]

// billid = H1225
const secondCommitteeHistory: BillHistory = [
  {
    Action: "Referred to the committee on Financial Services",
    Branch: "House",
    Date: "2021-03-29T14:50:09.363Z"
  },
  {
    Action: "Senate concurred",
    Branch: "Senate",
    Date: "2021-03-30T03:59:59.000Z"
  },
  {
    Action:
      "Hearing scheduled for 10/20/2021 from 11:00 AM-03:00 PM in Virtual Hearing",
    Branch: "Joint",
    Date: "2021-10-08T17:27:32.960Z"
  },
  {
    Action:
      "Bill reported favorably by committee and referred to the committee on House Ways and Means",
    Branch: "House",
    Date: "2022-03-29T15:39:47.187Z"
  }
]

//billid = H1035
const firstChamberHistory: BillHistory = [
  {
    Action: "Referred to the committee on Financial Services",
    Branch: "House",
    Date: "2021-03-29T14:50:09.363Z"
  },
  {
    Action: "Senate concurred",
    Branch: "Senate",
    Date: "2021-03-30T03:59:59.000Z"
  },
  {
    Action:
      "Hearing scheduled for 10/26/2021 from 11:00 AM-03:00 PM in Virtual Hearing",
    Branch: "Joint",
    Date: "2021-10-13T18:35:06.540Z"
  },
  {
    Action:
      '"Bill reported favorably by committee and referred to the committee on House Steering, Policy and Scheduling"',
    Branch: "House",
    Date: "2022-03-07T21:38:36.537Z"
  },
  {
    Action:
      "Committee reported that the matter be placed in the Orders of the Day for the next sitting for a second reading",
    Branch: "House",
    Date: "2022-05-17T18:36:54.917Z"
  }
]

// billid =  H2147
const secondChamberHistory: BillHistory = [
  {
    Action:
      "Referred to the committee on Municipalities and Regional Government",
    Branch: "House",
    Date: "2021-03-30T03:59:59.000Z"
  },
  {
    Action: "Senate concurred",
    Branch: "Senate",
    Date: "2021-03-30T03:59:59.000Z"
  },
  {
    Action:
      "Hearing scheduled for 06/22/2021 from 11:00 AM-03:00 PM in Virtual Hearing",
    Branch: "Joint",
    Date: "2021-06-15T15:09:21.547Z"
  },
  {
    Action:
      '"Bill reported favorably by committee and referred to the committee on House Steering, Policy and Scheduling"',
    Branch: "House",
    Date: "2021-08-16T16:06:58.550Z"
  },
  {
    Action:
      "Committee reported that the matter be placed in the Orders of the Day for the next sitting",
    Branch: "House",
    Date: "2021-09-13T15:07:12.453Z"
  },
  {
    Action: "Rules suspended",
    Branch: "House",
    Date: "2021-09-13T04:00:00.000Z"
  },
  {
    Action: "Read second and ordered to a third reading",
    Branch: "House",
    Date: "2021-09-13T15:08:10.563Z"
  },
  {
    Action: "Read third and passed to be engrossed",
    Branch: "House",
    Date: "2021-10-18T04:00:00.000Z"
  },
  {
    Action: "Read; and placed in the Orders of the Day for the next session",
    Branch: "Senate",
    Date: "2021-10-21T15:07:59.840Z"
  },
  {
    Action: "Read second and ordered to a third reading",
    Branch: "Senate",
    Date: "2021-11-17T16:07:59.820Z"
  }
]

// bill with status "signed" -- billId = H100
const signedHistory: BillHistory = [
  {
    Action: "Referred to the committee on The Judiciary",
    Branch: "House",
    Date: "2021-04-01T17:04:17.083Z"
  },
  {
    Action: "Senate concurred",
    Branch: "Senate",
    Date: "2021-04-01T15:41:00.000Z"
  },
  {
    Action:
      "Bill reported favorably by committee and referred to the committee on House Steering, Policy and Scheduling",
    Branch: "House",
    Date: "2021-04-14T17:35:11.223Z"
  },
  {
    Action:
      "Committee reported that the matter be placed in the Orders of the Day for the next sitting for a second reading",
    Branch: "House",
    Date: "2021-04-14T17:35:58.097Z"
  },
  {
    Action: "Read second and ordered to a third reading",
    Branch: "House",
    Date: "2021-04-15T15:16:10.033Z"
  },
  {
    Action: "Read third and passed to be engrossed",
    Branch: "House",
    Date: "2021-04-28T04:00:00.000Z"
  },
  {
    Action: "Read, rules suspended, read second and ordered to a third reading",
    Branch: "Senate",
    Date: "2021-04-29T04:00:00.000Z"
  },
  {
    Action: "Taken out of the Orders of the Day",
    Branch: "Senate",
    Date: "2021-06-03T15:12:00.000Z"
  },
  {
    Action: "Read third (title changed) and passed to be engrossed",
    Branch: "Senate",
    Date: "2021-06-03T15:12:00.000Z"
  },
  {
    Action: "Emergency preamble adopted",
    Branch: "House",
    Date: "2021-06-07T15:06:55.583Z"
  },
  {
    Action: "Emergency preamble adopted",
    Branch: "Senate",
    Date: "2021-06-07T15:26:51.847Z"
  },
  { Action: "Enacted", Branch: "House", Date: "2021-06-07T04:00:00.000Z" },
  {
    Action: "Enacted and laid before the Governor",
    Branch: "Senate",
    Date: "2021-06-07T15:26:51.847Z"
  },
  {
    Action: "Signed by the Governor, Chapter 18 of the Acts of 2021",
    Branch: "Executive",
    Date: "2021-06-09T04:00:00.000Z"
  }
]

const getBillTracker = (billId: string, court: number) =>
  testDb
    .doc(billTrackerPath(billId, court))
    .get()
    .then(s => {
      if (s.exists) return s.data() as BillTracker
    })

describe.skip("billTracker", () => {
  describe("calculate status", () => {
    test("detects bill Introduced", () => {
      const billIntroduced = predictBillStatus(noHistory)
      expect(billIntroduced).toBe(Stage.billIntroduced)
    })

    test("detects first committee", () => {
      const firstCommittee = predictBillStatus(firstCommitteeHistory)
      expect(firstCommittee).toBe(Stage.firstCommittee)
    })

    test("detects chamber committee", () => {
      const secondCommittee = predictBillStatus(secondCommitteeHistory)
      expect(secondCommittee).toBe(Stage.secondCommittee)
    })

    test("detects first chamber", () => {
      const firstChamber = predictBillStatus(firstChamberHistory)
      expect(firstChamber).toBe(Stage.firstChamber)
    })

    test("detects second chamber", () => {
      const secondCommittee = predictBillStatus(secondCommitteeHistory)
      expect(secondCommittee).toBe(Stage.secondCommittee)
    })

    test("detects signed", () => {
      const signed = predictBillStatus(signedHistory)
      expect(signed).toBe(Stage.signed)
    })
  })

  describe.skip("on bill document change", () => {
    let court: number, billId: string, billPath: string
    beforeAll(async () => {
      court = 192
      billId = nanoid()

      // Check that no tracker doc exists
      const tracker = await getBillTracker(billId, court)
      expect(tracker).toBeUndefined()

      // Update a bill doc with new history
      const b = await createNewBill({
        id: billId,
        court,
        history: firstCommitteeHistory
      })
      billPath = b
    })

    const expectBillStage = (
      check: Stage | ((tracker: BillTracker | undefined) => any),
      id = billId,
      c = court
    ) =>
      waitFor(
        async () => {
          const tracker = await getBillTracker(id, c)
          if (typeof check === "function") await check(tracker)
          else
            expect(tracker).toMatchObject({
              court,
              id: billId,
              prediction: { status: check }
            } as BillTracker)
        },
        { interval: 100, timeout: 500 }
      )

    test("creates new tracker doc for new bill", async () => {
      // Wait for tracker doc to be created with expected status
      await expectBillStage(Stage.firstCommittee)
    })

    test("updates tracker doc for updated history", async () => {
      // Update bill doc again
      await testDb.doc(billPath).update({ history: signedHistory })
      // Wait for updated tracker doc
      await expectBillStage(Stage.signed)
    })

    test("does nothing if history does not change", async () => {
      // Update an unrelated bill field
      await testDb.doc(billPath).update({ testimonyCount: 10 })

      // Bill
      await waitFor(async () => {
        const snap = await testDb.doc(billPath).get()
        expect(snap.data()?.testimonyCount).toEqual(10)
      })

      // Tracker does not change
      await expect(() =>
        expectBillStage(tracker =>
          expect(tracker?.prediction?.status).not.toEqual(Stage.signed)
        )
      ).rejects.toThrow()
    })

    test("updates tracker doc if version is different", async () => {
      const tracker = await getBillTracker(billId, court)
      await testDb
        .doc(billTrackerPath(billId, court))
        .update({ prediction: { version: tracker!.prediction!.version + 1 } })
      // Update bill doc
      await testDb.doc(billPath).update({ testimonyCount: 123 })
      // Wait for updated tracker doc
      await expectBillStage(updated => {
        expect(updated?.prediction?.createdAt).not.toEqual(
          tracker?.prediction?.createdAt
        )
      })
    })

    test("retains labels", async () => {
      const court = 192,
        billId = nanoid()

      await testDb.doc(billTrackerPath(billId, court)).set({
        id: billId,
        court: court,
        label: {
          attribution: "alex",
          createdAt: testTimestamp.now(),
          status: Stage.signed
        }
      } as BillTracker)

      await createNewBill({
        id: billId,
        court,
        history: firstCommitteeHistory
      })

      await expectBillStage(
        tracker => {
          expect(tracker?.label?.status).toEqual(Stage.signed)
          expect(tracker?.prediction?.status).toEqual(Stage.firstCommittee)
        },
        billId,
        court
      )
    })
  })
})
