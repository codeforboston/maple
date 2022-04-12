import { act, renderHook } from "@testing-library/react-hooks"
import { DateTime } from "luxon"
import { useBills } from "."
import { terminateFirebase, testDb } from "../../tests/testUtils"
import * as common from "./common"

const mockedNow = jest.spyOn(common, "now")

afterAll(terminateFirebase)

describe("useBills", () => {
  it("fetches bills", async () => {
    const { waitFor, result } = renderHook(() => useBills())

    expect(result.current.pagination.currentPage).toBe(1)
    expect(result.current.items.loading).toBe(true)

    await waitFor(() => expect(result.current.items.loading).toBeFalsy())
    expect(result.current.items.result).toHaveLength(
      result.current.pagination.itemsPerPage
    )
    expect(result.current.pagination.hasNextPage).toBeTruthy()
    expect(result.current.pagination.hasPreviousPage).toBeFalsy()
  })

  it("paginates", async () => {
    const { waitFor, result } = renderHook(() => useBills())
    await waitFor(() => expect(result.current.items.result).toBeDefined())

    // Move to the next page
    act(() => void result.current.pagination.nextPage())
    expect(result.current.pagination.currentPage).toBe(2)
    expect(result.current.items.result).toBeUndefined()
    await waitFor(() => expect(result.current.items.result).toBeDefined())
    expect(result.current.pagination.hasNextPage).toBeTruthy()
    expect(result.current.pagination.hasPreviousPage).toBeTruthy()

    // move to the previous page
    act(() => void result.current.pagination.previousPage())
    expect(result.current.items.result).toBeUndefined()
    expect(result.current.pagination.currentPage).toBe(1)
    await waitFor(() => expect(result.current.items.result).toBeDefined())
    expect(result.current.pagination.hasNextPage).toBeTruthy()
    expect(result.current.pagination.hasPreviousPage).toBeFalsy()
  })

  it("filters by billId", async () => {
    const { waitFor, result } = renderHook(() => useBills())

    await waitFor(() => expect(result.current.items.loading).toBeFalsy())

    act(() => void result.current.setFilter({ type: "bill", id: "H1" }))
    await waitFor(() => expect(result.current.items.result).toHaveLength(1))
    expect(result.current.items.result?.[0].content.BillNumber).toBe("H1")
  })

  it("sorts by id", async () => {
    const bills = await renderWithSort("id")

    const keys = bills.map(b => b.id),
      sorted = [...keys].sort()

    expect(keys).toEqual(sorted)
  })

  it("sorts by descending cosponsorCount", async () => {
    const bills = await renderWithSort("cosponsorCount")

    const keys = bills.map(b => b.cosponsorCount),
      sorted = [...keys].sort((a, b) => b - a)

    expect(keys).toEqual(sorted)
  })

  it("sorts by descending testimonyCount", async () => {
    await setTestimonyCount("H1051", 40)
    await setTestimonyCount("H1018", 20)
    await setTestimonyCount("H1050", 10)

    const bills = await renderWithSort("testimonyCount")

    const ids = bills.map(b => b.id)
    expect(ids.slice(0, 3)).toEqual(["H1051", "H1018", "H1050"])
  })

  it("sorts by descending latestTestimony", async () => {
    await setLatestTestimony("H1051", new Date("2030-10-01"))
    await setLatestTestimony("H1018", new Date("2030-05-01"))
    await setLatestTestimony("H1050", new Date("2030-02-01"))

    const bills = await renderWithSort("latestTestimony")

    const ids = bills.map(b => b.id)
    expect(ids.slice(0, 3)).toEqual(["H1051", "H1018", "H1050"])
  })

  it("sorts by descending hearing date", async () => {
    // Test the seeded events
    const cutoff = DateTime.utc(2022, 3, 8)
    mockedNow.mockReturnValue(cutoff)

    const bills = await renderWithSort("hearingDate")
    const hearingDates = bills.map(b => {
      expect(b.nextHearingAt).toBeDefined()
      return b.nextHearingAt!.toMillis()
    })

    expect(hearingDates).not.toHaveLength(0)
    expect(hearingDates[0]).toBeGreaterThanOrEqual(cutoff.toMillis())
    expect(hearingDates).toEqual(hearingDates.slice().sort().reverse())
  })
})

async function renderWithSort(sort: any) {
  const { waitFor, result } = renderHook(() => useBills())
  act(() => void result.current.setSort(sort))
  await waitFor(() => expect(result.current.items.loading).toBeFalsy())

  return result.current.items.result!
}

async function setTestimonyCount(billId: string, testimonyCount: number) {
  await testDb
    .doc(`/generalCourts/192/bills/${billId}`)
    .update({ testimonyCount })
}

async function setLatestTestimony(billId: string, latestTestimonyAt: Date) {
  await testDb
    .doc(`/generalCourts/192/bills/${billId}`)
    .update({ latestTestimonyAt })
}
