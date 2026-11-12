const collection = jest.fn()
jest.mock("firebase-admin", () => ({ firestore: () => ({ collection }) }))

import { listSponsors } from "./queries"

const bill = (name?: string) => ({
  data: () => ({ content: { PrimarySponsor: name && { Name: name } } })
})

test("queries apply the schema defaults without the MCP SDK", async () => {
  collection.mockReturnValue({
    limit: () => ({
      get: async () => ({
        docs: [bill("Jane Doe"), bill(), bill("Adam Roe"), bill("Jane Doe")]
      })
    })
  })
  expect(await listSponsors({})).toEqual(["Adam Roe", "Jane Doe"])
  expect(collection).toHaveBeenCalledWith(
    `generalCourts/${process.env.CURRENT_COURT ?? 194}/bills`
  )
  await expect(listSponsors({ court: "194" })).rejects.toThrow()
})
