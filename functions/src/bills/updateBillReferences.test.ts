import { Timestamp } from "../firebase"
import { Hearing } from "../events/types"
import { computeEventUpdates, EventMatchBill } from "./updateBillReferences"

/** Helper to create a minimal Hearing object for testing */
function createHearing(
  id: string,
  startsAt: Timestamp,
  documents: Array<{ billNumber: string; courtNumber: number }>
): Hearing {
  return {
    id,
    type: "hearing",
    startsAt,
    fetchedAt: Timestamp.fromMillis(Date.now()),
    content: {
      EventId: 1,
      EventDate: "2026-02-01T10:00:00",
      StartTime: "2026-02-01T10:00:00",
      Description: "Test hearing",
      Name: "Test Hearing",
      Status: "Scheduled",
      HearingHost: {
        CommitteeCode: "ABC",
        GeneralCourtNumber: 194
      },
      Location: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        LocationName: "Room 1",
        State: null,
        ZipCode: null
      },
      HearingAgendas: [
        {
          DocumentsInAgenda: documents.map(doc => ({
            BillNumber: doc.billNumber,
            GeneralCourtNumber: doc.courtNumber,
            PrimarySponsor: null,
            Title: "Test Bill"
          })),
          StartTime: "2026-02-01T10:00:00",
          EndTime: "2026-02-01T11:00:00",
          Topic: "Test Topic"
        }
      ],
      RescheduledHearing: null
    }
  }
}

describe("computeEventUpdates", () => {
  const futureTime = Timestamp.fromMillis(Date.now() + 86400000) // 1 day in future
  const now = Timestamp.fromMillis(Date.now())

  describe("court matching", () => {
    it("links a bill with an associated hearing when both are in the same court", () => {
      const bills: EventMatchBill[] = [{ id: "H100", court: 194 }]

      const hearings: Hearing[] = [
        createHearing("hearing-1", futureTime, [
          { billNumber: "H100", courtNumber: 194 }
        ])
      ]

      const updates = computeEventUpdates(bills, hearings, now)

      expect(updates.get("H100")).toBeDefined()
      expect(updates.get("H100")?.hearingIds).toContain("hearing-1")
      expect(updates.get("H100")?.nextHearingId).toBe("hearing-1")
    })

    it("does not link a bill with an associated hearing when they are in different courts", () => {
      const bills: EventMatchBill[] = [{ id: "H100", court: 194 }]

      const hearings: Hearing[] = [
        createHearing("hearing-1", futureTime, [
          { billNumber: "H100", courtNumber: 193 } // Different court
        ])
      ]

      const updates = computeEventUpdates(bills, hearings, now)

      // Bill should not have any hearing updates since courts don't match
      expect(updates.get("H100")).toBeUndefined()
    })

    it("does not link a bill with a hearing if the bill id is not found in the hearing's agenda", () => {
      const bills: EventMatchBill[] = [{ id: "H100", court: 194 }]

      const hearings: Hearing[] = [
        createHearing("hearing-1", futureTime, [
          { billNumber: "H200", courtNumber: 194 } // Different bill
        ])
      ]

      const updates = computeEventUpdates(bills, hearings, now)

      // H100 should not have any hearing updates
      expect(updates.get("H100")).toBeUndefined()
      // H200 is in the hearing but not in our bills list, so no court match possible
      expect(updates.get("H200")).toBeUndefined()
    })
  })

  describe("multiple hearings and bills", () => {
    it("correctly matches multiple bills with different courts to their respective hearings", () => {
      const bills: EventMatchBill[] = [
        { id: "H100", court: 194 },
        { id: "H101", court: 193 }
      ]

      const hearings: Hearing[] = [
        createHearing("hearing-2", futureTime, [
          { billNumber: "H100", courtNumber: 194 }
        ]),
        createHearing("hearing-1", futureTime, [
          { billNumber: "H101", courtNumber: 193 }
        ])
      ]

      const updates = computeEventUpdates(bills, hearings, now)

      expect(updates.get("H100")?.hearingIds).toContain("hearing-2")
      expect(updates.get("H100")?.hearingIds).not.toContain("hearing-1")

      expect(updates.get("H101")?.hearingIds).toContain("hearing-1")
      expect(updates.get("H101")?.hearingIds).not.toContain("hearing-2")
    })

    it("only matches bills to hearings with matching court, even when bill appears in multiple hearings", () => {
      const bills: EventMatchBill[] = [{ id: "H100", court: 194 }]

      const hearings: Hearing[] = [
        createHearing("hearing-correct-court", futureTime, [
          { billNumber: "H100", courtNumber: 194 }
        ]),
        createHearing("hearing-wrong-court", futureTime, [
          { billNumber: "H100", courtNumber: 193 }
        ])
      ]

      const updates = computeEventUpdates(bills, hearings, now)

      expect(updates.get("H100")?.hearingIds).toContain("hearing-correct-court")
      expect(updates.get("H100")?.hearingIds).not.toContain(
        "hearing-wrong-court"
      )
      expect(updates.get("H100")?.hearingIds).toHaveLength(1)
    })
  })

  describe("bills without court field", () => {
    it("does not link a bill without a court field to any hearing", () => {
      const bills: EventMatchBill[] = [{ id: "H100" }] // No court field

      const hearings: Hearing[] = [
        createHearing("hearing-1", futureTime, [
          { billNumber: "H100", courtNumber: 194 }
        ])
      ]

      const updates = computeEventUpdates(bills, hearings, now)

      expect(updates.get("H100")).toBeUndefined()
    })
  })
})
