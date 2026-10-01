import { normalizeEntityName as norm } from "./normalize"

// Same cases as lobbying-scraper/tests/test_normalize.py: the two
// implementations must agree.
describe("normalizeEntityName", () => {
  it.each([
    [
      "Smith, Costello & Crawford",
      "Smith Costello & Crawford Public Policy Group, LLC"
    ],
    ["Lynch & Fierro", "Lynch and Fierro, Counsellors at Law"],
    ["O'Neill and Associates", "O’Neill and Partners, LLC"],
    ["Delaney & Associates, INC", "Delaney and Associates, Inc"],
    ["Glynn Assiciates", "Glynn Associates"],
    ["JajugaAssociates", "Jajuga Associates"],
    ["Michael Muse, Attornet at Law", "Michael Muse Attorney at Law"],
    ["Morrison&Foerster", "Morrison & Foerster LLP"],
    ["C&J Bus Lines", "C & J Bus Lines, Inc."]
  ])("groups %s with %s", (a, b) => {
    expect(norm(a)).toBe(norm(b))
  })

  it.each([
    ["Delaney and Associates, Inc", "Delaney Legislative Services, Inc."],
    ["Delaney Policy Group", "Delaney Legislative Services, Inc."],
    ["Delaney Policy Group", "Delaney & Associates, INC"]
  ])("keeps %s apart from %s", (a, b) => {
    expect(norm(a)).not.toBe(norm(b))
  })

  it("keeps a bare-surname firm's descriptor", () => {
    expect(norm("Delaney Legislative Services, Inc.")).toBe(
      "DELANEY LEGISLATIVE SERVICES"
    )
    expect(norm("Delaney & Associates")).toBe("DELANEY ASSOCIATES")
  })

  it("leaves people's names alone", () => {
    expect(norm("Carlo Basile")).toBe("CARLO BASILE")
    expect(norm("Hugh R. Jones, III")).toBe("HUGH R JONES III")
  })

  it("removes phrases as whole words only", () => {
    expect(norm("Cape Cod and Associations Group")).toBe(
      "CAPE COD AND ASSOCIATIONS GROUP"
    )
  })
})
