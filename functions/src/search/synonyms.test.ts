import { legislativeSynonymItems } from "./synonyms"

describe("legislativeSynonymItems", () => {
  /** The constructors make the other invariants unrepresentable; a duplicate
   * id is the one mistake left — two entries for the same head or root, where
   * the second silently replaces the first on the server. */
  it("has unique ids", () => {
    const ids = legislativeSynonymItems.map(i => i.id)
    expect(new Set(ids).size).toEqual(ids.length)
  })
})
