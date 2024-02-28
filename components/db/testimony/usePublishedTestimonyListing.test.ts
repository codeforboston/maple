import { renderHook, waitFor } from "@testing-library/react"
import { usePublishedTestimonyListing } from "."
import { terminateFirebase, testAuth } from "../../../tests/testUtils"

afterAll(terminateFirebase)

/** These tests use data seeded in `tests/seed/seedTestimony` */
describe("usePublishedTestimonyListing", () => {
  it("lists published testimony for a particular bill", async () => {
    const { result } = renderHook(() =>
      usePublishedTestimonyListing({ billId: "H1" })
    )

    await waitFor(() => expect(result.current.items.loading).toBeFalsy())

    const testimony = result.current.items.result!
    expect(testimony).not.toHaveLength(0)
    testimony.forEach(t => {
      expect(t.billId).toEqual("H1")
      expect(t.content).toBeTruthy()
    })
  })

  it("lists published testimony for a particular user", async () => {
    const { uid } = await testAuth.getUserByEmail("test3@example.com")

    const { result } = renderHook(() => usePublishedTestimonyListing({ uid }))

    await waitFor(() => expect(result.current.items.loading).toBeFalsy())

    const testimony = result.current.items.result!
    expect(testimony).not.toHaveLength(0)
    testimony.forEach(t => {
      expect(t.authorUid).toEqual(uid)
      expect(t.content).toBeTruthy()
    })
  })

  it("lists published testimony for a particular user and bill", async () => {
    const { uid } = await testAuth.getUserByEmail("test3@example.com")

    const { result } = renderHook(() =>
      usePublishedTestimonyListing({ billId: "H1", uid })
    )

    await waitFor(() => expect(result.current.items.loading).toBeFalsy())

    const testimony = result.current.items.result!
    expect(testimony).toHaveLength(1)
    expect(testimony[0].authorUid).toBe(uid)
    expect(testimony[0].billId).toBe("H1")
  })
})
