const collection = jest.fn()
jest.mock("firebase-admin", () => ({ firestore: () => ({ collection }) }))

import { listSponsors } from "./queries"

const bills = (...names: (string | undefined)[]) => {
  const docs = names.map(name => ({ get: () => name }))
  return { empty: !docs.length, docs }
}

test("queries default to the newest court with bills, without the MCP SDK", async () => {
  delete process.env.CURRENT_COURT
  const selected: string[][] = []
  collection.mockImplementation((path: string) =>
    path === "generalCourts"
      ? { listDocuments: async () => [{ id: "194" }, { id: "195" }] }
      : {
          select: (...fields: string[]) => {
            selected.push(fields)
            const result = async () =>
              path.includes("195")
                ? bills()
                : bills("Jane Doe", undefined, "Adam Roe", "Jane Doe")
            return { get: result, limit: () => ({ get: result }) }
          }
        }
  )
  expect(await listSponsors({})).toEqual(["Adam Roe", "Jane Doe"])
  expect(collection).toHaveBeenCalledWith("generalCourts/194/bills")
  expect(selected).toContainEqual(["content.PrimarySponsor.Name"])
  await expect(listSponsors({ court: "194" })).rejects.toThrow()
})
