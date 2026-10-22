import { DraftTestimony } from "./types"

const draft = {
  billId: "S2581",
  court: 194,
  content: "text",
  attachmentId: null,
  editReason: null,
  ballotQuestionId: null
}

describe("DraftTestimony position", () => {
  it("takes a bill position on bill testimony", () => {
    expect(DraftTestimony.guard({ ...draft, position: "endorse" })).toBe(true)
    expect(DraftTestimony.guard({ ...draft, position: "passNothing" })).toBe(
      false
    )
  })

  it("takes a conference position on conference testimony", () => {
    const conference = { ...draft, conferenceId: "data-privacy" }
    expect(
      DraftTestimony.guard({ ...conference, position: "passSenateVersion" })
    ).toBe(true)
    expect(DraftTestimony.guard({ ...conference, position: "oppose" })).toBe(
      false
    )
  })
})
