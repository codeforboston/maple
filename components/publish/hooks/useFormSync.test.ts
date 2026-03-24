import { hasMeaningfulDraftContent } from "./useFormSync"

describe("hasMeaningfulDraftContent", () => {
  it("treats ballotQuestionId-only form state as empty", () => {
    expect(
      hasMeaningfulDraftContent({
        attachmentId: undefined,
        content: undefined,
        position: undefined,
        recipientMemberCodes: undefined,
        editReason: undefined,
        ballotQuestionId: "25-14"
      })
    ).toBe(false)
  })

  it("treats authored testimony fields as meaningful content", () => {
    expect(
      hasMeaningfulDraftContent({
        attachmentId: undefined,
        content: "Testimony text",
        position: undefined,
        recipientMemberCodes: undefined,
        editReason: undefined,
        ballotQuestionId: "25-14"
      })
    ).toBe(true)

    expect(
      hasMeaningfulDraftContent({
        attachmentId: undefined,
        content: undefined,
        position: "endorse",
        recipientMemberCodes: undefined,
        editReason: undefined,
        ballotQuestionId: "25-14"
      })
    ).toBe(true)
  })
})
