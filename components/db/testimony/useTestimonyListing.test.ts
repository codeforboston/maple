import { act, renderHook } from "@testing-library/react-hooks"
import { useTestimonyListing } from "."
import { signInUser2, signInUser3 } from "../../../tests/integration/common"
import { terminateFirebase, testDb } from "../../../tests/testUtils"
import { currentGeneralCourt } from "../common"

// jest.setTimeout(10000)

afterAll(terminateFirebase)

/** These tests use data seeded in `tests/seed/seedTestimony` */
describe("useTestimonyListing", () => {
  it("list all testimony for a particular user", async () => {
    const { uid } = await signInUser3()

    const { result, waitFor } = renderHook(() => useTestimonyListing(uid))

    await waitFor(
      () => {
        expect(result.current.loading).toBeFalsy()

        const testimony = result.current.testimony!
        expect(testimony).not.toHaveLength(0)

        const billsWithDrafts = testimony
          .filter(t => t.draft)
          .map(t => t.billId)
        const expectedDrafts = ["H1", "H10", "H1002", "H1003", "H1004"]
        expect(billsWithDrafts.sort()).toEqual(expectedDrafts.sort())

        const billsWithTestimony = testimony
          .filter(t => t.publication)
          .map(t => t.billId)
        const expectedTestimony = ["H1", "H10", "H1001", "H1002"]
        expect(billsWithTestimony.sort()).toEqual(expectedTestimony.sort())
      },
      {
        interval: 250,
        timeout: 5000
      }
    )
  })

  it("updates as testimony is added", async () => {
    const { uid } = await signInUser2()
    const { result, waitFor } = renderHook(() => useTestimonyListing(uid))
    await waitFor(() => expect(result.current.loading).toBeFalsy(), {
      timeout: 5000
    })

    await act(async () => {
      await testDb.collection(`users/${uid}/draftTestimony`).add({
        billId: "H1010",
        court: currentGeneralCourt,
        content: "fake testimony",
        position: "endorse"
      })
    })

    await waitFor(
      () =>
        expect(
          result.current.testimony?.find(t => t.billId === "H1010")
        ).toBeDefined(),
      { timeout: 5000 }
    )
  })
})
