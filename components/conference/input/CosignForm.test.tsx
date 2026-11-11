import "@testing-library/jest-dom"
import { act, fireEvent, render, screen } from "@testing-library/react"
import type {
  ConferenceTestimony,
  UseEditConferenceTestimony
} from "components/db"
import { CosignForm, CosignStep } from "./CosignForm"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      opts && Object.keys(opts).length
        ? `${key} ${Object.values(opts).join(" ")}`
        : key,
    i18n: { language: "en" }
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>
}))

jest.mock("components/auth", () => ({
  useAuth: () => ({
    claims: { role: "user" },
    user: { email: "gina@example.org" }
  })
}))
const mockProfile: { current: Record<string, unknown> } = { current: {} }
jest.mock("components/db", () => ({
  useProfile: () => ({ profile: mockProfile.current }),
  useMember: () => ({ member: undefined })
}))

const legislators = {
  representative: { id: "r1", name: "Rae Rep", district: "3rd Middlesex" },
  senator: { id: "s1", name: "Sam Sen", district: "Middlesex and Suffolk" }
}
beforeEach(() => {
  mockProfile.current = { fullName: "Gina K.", ...legislators }
})

const parent = {
  id: "p1",
  authorUid: "org",
  authorDisplayName: "Example Coalition",
  fullName: "Example Coalition",
  authorRole: "organization",
  position: "passSenateVersion",
  content: "The letter.",
  cosignCount: 2,
  publishedAt: { toDate: () => new Date(2026, 9, 1) }
} as unknown as ConferenceTestimony

/** The draft hook as the form drives it: each call recorded, nothing saved. */
const editing = (
  overrides: Partial<UseEditConferenceTestimony> = {}
): UseEditConferenceTestimony =>
  ({
    saveDraft: { execute: jest.fn().mockResolvedValue(undefined) },
    publishTestimony: { execute: jest.fn().mockResolvedValue(undefined) },
    discardDraft: { execute: jest.fn().mockResolvedValue(undefined) },
    loading: false,
    draftLoading: false,
    ...overrides
  } as unknown as UseEditConferenceTestimony)

const mount = (
  edit: UseEditConferenceTestimony,
  step: CosignStep,
  more: { onStep?: jest.Mock; onPosted?: jest.Mock } = {}
) =>
  render(
    <CosignForm
      edit={edit}
      parent={parent}
      court={194}
      subject="Phone-Free Schools"
      conferees={["CC", "BF"]}
      step={step}
      onStep={more.onStep ?? jest.fn()}
      onCancel={jest.fn()}
      onPosted={more.onPosted ?? jest.fn()}
    />
  )

const press = (name: string) =>
  fireEvent.click(screen.getByRole("button", { name }))

describe("CosignForm", () => {
  it("asks the reader to say they have read it before going on", () => {
    const edit = editing()
    const onStep = jest.fn()
    mount(edit, "confirm", { onStep })
    expect(screen.getByText("Example Coalition")).toBeInTheDocument()
    press("input.cosign_continue")
    expect(onStep).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole("checkbox"))
    press("input.cosign_continue")
    expect(onStep).toHaveBeenCalledWith("write")
    // Agreeing makes the draft a cosign of the parent, at its position.
    expect(edit.saveDraft.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        cosignOfId: "p1",
        cosignOfAuthorUid: "org",
        position: "passSenateVersion",
        content: ""
      })
    )
  })

  it("warns that agreeing writes over a note cosigning another", () => {
    mount(
      editing({
        draft: { cosignOfId: "p0", content: "My note." }
      } as Partial<UseEditConferenceTestimony>),
      "confirm"
    )
    expect(screen.getByRole("note")).toHaveTextContent(
      "input.cosign_replaces_gone"
    )
  })

  it.each([
    ["this parent", { cosignOfId: "p1", content: "My note." }],
    ["no words", { cosignOfId: "p0", content: " " }]
  ])("does not warn over a draft cosigning %s", (_, draft) => {
    mount(editing({ draft } as Partial<UseEditConferenceTestimony>), "confirm")
    expect(screen.queryByRole("note")).not.toBeInTheDocument()
  })

  it("asks for words or for none before filing", async () => {
    const draft = { cosignOfId: "p1", content: "" }
    const edit = editing({ draft } as Partial<UseEditConferenceTestimony>)
    const onPosted = jest.fn()
    const onStep = jest.fn()
    mount(edit, "write", { onPosted, onStep })
    press("input.review")
    expect(onStep).not.toHaveBeenCalled()

    fireEvent.click(
      screen.getByRole("checkbox", { name: "input.cosign_no_words_label" })
    )
    expect(screen.getByRole("textbox")).toBeDisabled()
    press("input.review")
    expect(onStep).toHaveBeenCalledWith("review")
    expect(edit.publishTestimony.execute).not.toHaveBeenCalled()
  })

  describe("review", () => {
    const draft = { cosignOfId: "p1", content: "My note." }

    it("shows where the cosign goes and the letter as sent, and posts it", async () => {
      const edit = editing({ draft } as Partial<UseEditConferenceTestimony>)
      const onPosted = jest.fn()
      mount(edit, "review", { onPosted })
      expect(screen.getByText("review.goes_cosign")).toBeInTheDocument()
      expect(
        screen.getByText("Dear Representative Rae Rep and Senator Sam Sen,")
      ).toBeInTheDocument()
      expect(
        screen.getByText("I cosigned this input by Example Coalition on MAPLE:")
      ).toBeInTheDocument()
      expect(screen.getByText("The letter.")).toBeInTheDocument()
      // The reader is copied, and replies go to them.
      expect(screen.getAllByText("gina@example.org").length).toBeGreaterThan(1)
      await act(async () => press("review.cosign_and_send"))
      expect(edit.publishTestimony.execute).toHaveBeenCalled()
      expect(onPosted).toHaveBeenCalled()
    })

    it("tells a cosign without words of its own that it still counts", () => {
      const onStep = jest.fn()
      mount(
        editing({
          draft: { cosignOfId: "p1", content: "" }
        } as Partial<UseEditConferenceTestimony>),
        "review",
        { onStep }
      )
      expect(screen.getByText(/review\.no_line/)).toBeInTheDocument()
      press("review.add_line")
      expect(onStep).toHaveBeenCalledWith("write")
    })

    it("says no banner over a cosign with words", () => {
      mount(editing({ draft } as Partial<UseEditConferenceTestimony>), "review")
      expect(screen.queryByText(/review\.no_line/)).not.toBeInTheDocument()
    })

    it("says so, and sends no letter, when MAPLE has no one to notify", async () => {
      mockProfile.current = { fullName: "Gina K." }
      const edit = editing({ draft } as Partial<UseEditConferenceTestimony>)
      mount(edit, "review")
      expect(screen.getByText("review.emailed_none")).toBeInTheDocument()
      expect(screen.queryByText("review.preview_label")).not.toBeInTheDocument()
      await act(async () => press("input.cosign"))
      expect(edit.publishTestimony.execute).toHaveBeenCalled()
    })

    it("keeps another reply-to address on the draft, for this letter alone", async () => {
      jest.useFakeTimers()
      const edit = editing({ draft } as Partial<UseEditConferenceTestimony>)
      mount(edit, "review")
      press("review.use_other")
      fireEvent.change(screen.getByLabelText("review.reply_to_label"), {
        target: { value: "gina.work@example.org" }
      })
      press("review.done")
      await act(async () => {
        jest.advanceTimersByTime(2000)
      })
      expect(edit.saveDraft.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          cosignOfId: "p1",
          replyTo: "gina.work@example.org"
        })
      )
      jest.useRealTimers()
    })

    it("refuses an address that isn't one", () => {
      const edit = editing({ draft } as Partial<UseEditConferenceTestimony>)
      mount(edit, "review")
      press("review.use_other")
      fireEvent.change(screen.getByLabelText("review.reply_to_label"), {
        target: { value: "not an address" }
      })
      press("review.done")
      expect(screen.getByRole("alert")).toHaveTextContent(
        "review.reply_to_invalid"
      )
    })
  })

  it.each([
    ["cosignParentGone", "input.cosign_parent_gone"],
    ["conferenceClosed", "input.cosign_closed"],
    ["any other", "input.error"]
  ])("words %s refusal for the reader", (refusal, message) => {
    const error = Object.assign(new Error("refused"), {
      details: { refusal }
    })
    mount(
      editing({
        publishTestimony: { execute: jest.fn(), error }
      } as unknown as Partial<UseEditConferenceTestimony>),
      "write"
    )
    expect(screen.getByRole("alert")).toHaveTextContent(message)
  })

  it("edits a posted cosign's words alone, with a reason", () => {
    const publication = { cosignOfId: "p1", content: "Before." }
    mount(
      editing({ publication } as Partial<UseEditConferenceTestimony>),
      "write"
    )
    expect(screen.getByRole("textbox")).toHaveValue("Before.")
    const save = screen.getByRole("button", { name: "input.cosign_save" })
    expect(save).toBeDisabled()
    expect(screen.queryByText("publish.reasonLabel")).not.toBeInTheDocument()
    // No way to pick another position, or to leave the parent.
    expect(
      screen.queryByRole("button", { name: /input\.position\./ })
    ).not.toBeInTheDocument()

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "After." }
    })
    expect(screen.getByText("publish.reasonLabel")).toBeInTheDocument()
    expect(save).toBeDisabled()
    fireEvent.change(screen.getAllByRole("textbox")[1], {
      target: { value: "Clearer" }
    })
    expect(save).toBeEnabled()
  })
})
