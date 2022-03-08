import { act, renderHook } from "@testing-library/react-hooks"
import { useBills } from "."
import { terminateFirebase, testDb } from "../../tests/testUtils"

afterAll(terminateFirebase)

describe("usePaginatedBills", () => {
  it("fetches bills", async () => {
    const { waitFor, result } = renderHook(() => useBills())

    expect(result.current.currentPage).toBe(1)
    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBeFalsy())
    expect(result.current.bills).toHaveLength(result.current.billsPerPage)
    expect(result.current.hasNextPage).toBeTruthy()
    expect(result.current.hasPreviousPage).toBeFalsy()
  })

  it("paginates", async () => {
    const { waitFor, result } = renderHook(() => useBills())
    await waitFor(() => expect(result.current.bills).toBeDefined())

    // Move to the next page
    act(() => void result.current.nextPage())
    expect(result.current.currentPage).toBe(2)
    expect(result.current.bills).toBeUndefined()
    await waitFor(() => expect(result.current.bills).toBeDefined())
    expect(result.current.hasNextPage).toBeTruthy()
    expect(result.current.hasPreviousPage).toBeTruthy()

    // move to the previous page
    act(() => void result.current.previousPage())
    expect(result.current.bills).toBeUndefined()
    expect(result.current.currentPage).toBe(1)
    await waitFor(() => expect(result.current.bills).toBeDefined())
    expect(result.current.hasNextPage).toBeTruthy()
    expect(result.current.hasPreviousPage).toBeFalsy()
  })

  it("filters by billId", async () => {
    const { waitFor, result } = renderHook(() => useBills())

    await waitFor(() => expect(result.current.loading).toBeFalsy())

    act(() => void result.current.setBillId("H1"))
    await waitFor(() => expect(result.current.bills).toHaveLength(1))
    expect(result.current.bills?.[0].content.BillNumber).toBe("H1")
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
})

async function renderWithSort(sort: any) {
  const { waitFor, result } = renderHook(() => useBills())
  act(() => void result.current.setSort(sort))
  await waitFor(() => expect(result.current.loading).toBeFalsy())

  return result.current.bills!
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
