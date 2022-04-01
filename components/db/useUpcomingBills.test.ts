import { renderHook } from "@testing-library/react-hooks"
import { useUpcomingBills } from "./useUpcomingBills"
import { terminateFirebase, testDb } from "../../tests/testUtils"

import * as common from "./common"

const mockedNow = jest.spyOn(common, "now")

afterAll(terminateFirebase)

describe("useUpcomingBills", () => {
  it("fetches bills", async () => {
    const { waitFor, result } = renderHook(() => useUpcomingBills())

    await waitFor(() => expect(result.current.loading).toBeFalsy())

    expect(result.current?.loading).toBe(false)
  })
})
