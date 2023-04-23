import { renderHook } from "@testing-library/react-hooks"
import { terminateFirebase, testDb, testTimestamp } from "../../tests/testUtils"
import { useUpcomingBills } from "./useUpcomingBills"

import { DateTime } from "luxon"
import { currentGeneralCourt } from "functions/src/shared"
import { midnight } from "./common"
import { useUpcomingEvents } from "./events"
import { createFakeBill } from "tests/integration/common"

const mockedMidnight = jest.mocked(midnight)

afterAll(terminateFirebase)

describe("useUpcomingBills", () => {
  it("fetches bills", async () => {
    // Test the seeded events
    const cutoff = DateTime.utc(2022, 3, 8)
    mockedMidnight.mockReturnValue(cutoff.toJSDate())

    const billId = await createFakeBill()
    await testDb
      .doc(`/generalCourts/${currentGeneralCourt}/bills/${billId}`)
      .update({
        nextHearingAt: testTimestamp.now()
      })

    const { waitFor, result } = renderHook(() => useUpcomingBills())

    await waitFor(() => expect(result.current).not.toHaveLength(0))
  })
})

describe("useUpcomingEvents", () => {
  it("fetches events", async () => {
    // Test the seeded events
    const cutoff = DateTime.utc(2022, 3, 8)
    mockedMidnight.mockReturnValue(cutoff.toJSDate())

    const { waitFor, result } = renderHook(() => useUpcomingEvents())

    await waitFor(() => expect(result.current).not.toHaveLength(0))
  })
})
