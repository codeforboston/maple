import { renderHook, act, waitFor } from "@testing-library/react"
import {
  TestimonyFilterOptions,
  usePublishedTestimonyListing
} from "../../components/db/testimony"
import { terminateFirebase, testAuth } from "../testUtils"
import { flattenDeep } from "lodash"

afterAll(terminateFirebase)

type Case = {
  user?: string
  bill?: string
  filter: TestimonyFilterOptions | null
}
const users = [undefined, "systemtestuser@example.com"]
const bills = [undefined, "H1007"]
const filters: (TestimonyFilterOptions | null)[] = [
  null,
  { representativeId: "E_U1" },
  { senatorId: "BRF0" }
]
const cases: Case[] = flattenDeep(
  users.map(user =>
    bills.map(bill => filters.map(filter => ({ user, bill, filter })))
  )
)

describe("usePublishedTestimonyListing", () => {
  it.each(cases)(
    "lists for user $user, bill $bill, filter $filter",
    async ({ user, bill, filter }) => {
      let uid: string | undefined = undefined
      if (user) {
        ;({ uid } = await testAuth.getUserByEmail(user))
      }
      const { result } = renderHook(() =>
        usePublishedTestimonyListing({ billId: bill, uid })
      )
      act(() => void result.current.setFilter(filter))
      await waitFor(() => expect(result.current.items.loading).toBeFalsy())
      expect(result.current.items.error).toBeUndefined()
      const testimony = result.current.items.result!
      expect(testimony).not.toHaveLength(0)
    }
  )
})
