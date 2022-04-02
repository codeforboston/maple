import { renderHook } from "@testing-library/react-hooks"
import { useUpcomingBills } from "./useUpcomingBills"
import { terminateFirebase, testDb } from "../../tests/testUtils"

import * as common from "./common"
import { DateTime } from "luxon"

const mockedNow = jest.spyOn(common, "now")

afterAll(terminateFirebase)

describe("useUpcomingBills", () => {
  it("fetches bills", async () => {
    // Test the seeded events
    const cutoff = DateTime.utc(2022, 3, 8)
    mockedNow.mockReturnValue(cutoff)

    const { waitFor, result } = renderHook(() => useUpcomingBills())

    await waitFor(() => expect(result.current).not.toHaveLength(0))
  })
})
