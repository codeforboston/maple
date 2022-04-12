import { act, renderHook } from "@testing-library/react-hooks"
import { flattenDeep } from "lodash"
import { FilterOptions, SortOptions, useBills } from "../../components/db"
import { terminateFirebase } from "../testUtils"

afterAll(terminateFirebase)

type Case = {
  sort: SortOptions
  filter: FilterOptions | null
}
const sorts: SortOptions[] = [
  "cosponsorCount",
  "hearingDate",
  "id",
  "latestTestimony",
  "testimonyCount"
]
const filters: (FilterOptions | null)[] = [
  null,
  { type: "bill", id: "H1" },
  { type: "city", name: "Boston" },
  { type: "committee", id: "H34" },
  { type: "primarySponsor", id: "E_U1" }
]
const cases: Case[] = flattenDeep(
  sorts.map(sort => filters.map(filter => ({ sort, filter })))
)

describe("useBills", () => {
  it.each(cases)(
    "lists for sort $sort, filter $filter",
    async ({ sort, filter }) => {
      const { result, waitFor } = renderHook(() => useBills())

      act(() => {
        result.current.setFilter(filter)
        result.current.setSort(sort)
      })
      await waitFor(() => expect(result.current.items.loading).toBeFalsy())
      expect(result.current.items.error).toBeUndefined()
      const testimony = result.current.items.result!
      expect(testimony).not.toHaveLength(0)
    }
  )
})
