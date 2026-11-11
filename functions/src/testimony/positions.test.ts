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

describe("DraftTestimony target", () => {
  it("names a ballot question or a conference, not both", () => {
    expect(
      DraftTestimony.guard({
        ...draft,
        position: "endorse",
        ballotQuestionId: "bq-1",
        conferenceId: "data-privacy"
      })
    ).toBe(false)
  })
})

describe("DraftTestimony cosign", () => {
  const conference = {
    ...draft,
    conferenceId: "data-privacy",
    position: "passNothing"
  }
  const parent = { cosignOfId: "parent-1", cosignOfAuthorUid: "author-1" }

  it("lets a cosign have an empty note", () => {
    expect(
      DraftTestimony.guard({ ...conference, ...parent, content: "" })
    ).toBe(true)
    expect(DraftTestimony.guard({ ...conference, content: "" })).toBe(false)
  })

  it("names both the parent's id and author", () => {
    expect(
      DraftTestimony.guard({ ...conference, cosignOfId: "parent-1" })
    ).toBe(false)
    expect(
      DraftTestimony.guard({ ...conference, cosignOfAuthorUid: "author-1" })
    ).toBe(false)
  })

  it("takes no attachment on a cosign", () => {
    expect(
      DraftTestimony.guard({ ...conference, ...parent, attachmentId: "a-1" })
    ).toBe(false)
  })
})
