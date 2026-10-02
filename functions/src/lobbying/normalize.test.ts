import { normalizeEntityName as norm } from "./normalize"

// Same cases as lobbying-scraper/tests/test_normalize.py: the two
// implementations must agree.
describe("normalizeEntityName", () => {
  it.each([
    ["Barlow, Finch & Kerr", "Barlow Finch & Kerr Public Policy Group, LLC"],
    ["Ward & Pell", "Ward and Pell, Counsellors at Law"],
    ["O'Dowd and Associates", "O’Dowd and Partners, LLC"],
    ["Hartwell & Associates, INC", "Hartwell and Associates, Inc"],
    ["Corbin Assiciates", "Corbin Associates"],
    ["TrevaniAssociates", "Trevani Associates"],
    ["Dana Pruitt, Attornet at Law", "Dana Pruitt Attorney at Law"],
    ["Halden&Voss", "Halden & Voss LLP"],
    ["R&T Bus Lines", "R & T Bus Lines, Inc."]
  ])("groups %s with %s", (a, b) => {
    expect(norm(a)).toBe(norm(b))
  })

  it.each([
    ["Hartwell and Associates, Inc", "Hartwell Legislative Services, Inc."],
    ["Hartwell Policy Group", "Hartwell Legislative Services, Inc."],
    ["Hartwell Policy Group", "Hartwell & Associates, INC"]
  ])("keeps %s apart from %s", (a, b) => {
    expect(norm(a)).not.toBe(norm(b))
  })

  it("keeps a bare-surname firm's descriptor", () => {
    expect(norm("Hartwell Legislative Services, Inc.")).toBe(
      "HARTWELL LEGISLATIVE SERVICES"
    )
    expect(norm("Hartwell & Associates")).toBe("HARTWELL ASSOCIATES")
  })

  it("leaves people's names alone", () => {
    expect(norm("Jordan Ellery")).toBe("JORDAN ELLERY")
    expect(norm("Avery T. Nolan, III")).toBe("AVERY T NOLAN III")
  })

  it("removes phrases as whole words only", () => {
    expect(norm("Cape Cod and Associations Group")).toBe(
      "CAPE COD AND ASSOCIATIONS GROUP"
    )
  })
})
