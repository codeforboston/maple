import { renderHook } from "@testing-library/react-hooks"
import { terminateFirebase } from "../../tests/testUtils"
import { useUpcomingBills } from "./useUpcomingBills"

import { DateTime } from "luxon"
import * as common from "./common"
import { useUpcomingEvents } from "./events"

const mockedMidnight = jest.spyOn(common, "midnight")

afterAll(terminateFirebase)

describe("useUpcomingBills", () => {
  it("fetches bills", async () => {
    // Test the seeded events
    const cutoff = DateTime.utc(2022, 3, 8)
    mockedMidnight.mockReturnValue(cutoff.toJSDate())

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
