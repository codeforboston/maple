import "@testing-library/jest-dom"
import { act, fireEvent, render, screen } from "@testing-library/react"
import type {
  ConferenceTestimony,
  UseEditConferenceTestimony
} from "components/db"
import { CosignForm } from "./CosignForm"
import type { Step } from "./InputForm"
import type { ConfereeView } from "../types"

// jsdom has none, and the preview card cuts the words to the lines of its
// note at its width, as in InputForm.test.tsx.
class Observer {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.assign(global, { ResizeObserver: Observer })

/** Two invented conferees, for the weekly update's row on the review. */
const conferees: ConfereeView[] = [
  {
    memberCode: "AQ1",
    branch: "Senate",
    chair: true,
    name: "Avery Quinlan",
    party: "Democrat",
    district: "First Essex",
    seat: null
  },
  {
    memberCode: "BR2",
    branch: "House",
    chair: true,
    name: "Blair Rowe",
    party: "Democrat",
    district: "2nd Middlesex",
    seat: null
  }
]

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
  useMember: () => ({ member: undefined }),
  // As components/db compares a draft with what was posted.
  hasDraftChanged: (
    draft?: Record<string, unknown>,
    published?: Record<string, unknown>
  ) =>
    !!draft &&
    !!published &&
    (["position", "content"] as const).some(
      k => (draft[k] || undefined) !== (published[k] || undefined)
    )
}))
jest.mock("components/db/legislatorMail", () => ({
  useLetterOnRecord: () => false
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
  step: Step,
  more: { onStep?: jest.Mock; onPosted?: jest.Mock } = {}
) =>
  render(
    <CosignForm
      edit={edit}
      parent={parent}
      court={194}
      conferenceId="H1-S1"
      subject="Phone-Free Schools"
      conferees={conferees}
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
    press("input.cosign_review")
    expect(onStep).not.toHaveBeenCalled()

    const noWords = () =>
      screen.getByRole("checkbox", { name: "input.cosign_no_words_label" })
    fireEvent.click(noWords())
    // Off while they've said no words.
    expect(screen.getByRole("textbox")).toBeDisabled()
    press("input.cosign_review")
    expect(onStep).toHaveBeenCalledWith("review")
    expect(edit.publishTestimony.execute).not.toHaveBeenCalled()

    // Unticking the box is the way back to writing.
    fireEvent.click(noWords())
    expect(screen.getByRole("textbox")).toBeEnabled()
  })

  describe("review", () => {
    const draft = { cosignOfId: "p1", content: "My note." }

    it("shows where the cosign goes and the letter as sent, and posts it", async () => {
      const edit = editing({ draft } as Partial<UseEditConferenceTestimony>)
      const onPosted = jest.fn()
      mount(edit, "review", { onPosted })
      expect(screen.getByText("review.goes_cosign")).toBeInTheDocument()
      // The cosign as MAPLE will show it first, and the letter a switch away.
      expect(
        screen.getByRole("button", { name: "review.preview_web" })
      ).toHaveAttribute("aria-pressed", "true")
      fireEvent.click(
        screen.getByRole("button", { name: "review.preview_email" })
      )
      expect(
        screen.getByText("Dear Representative Rae Rep and Senator Sam Sen,")
      ).toBeInTheDocument()
      expect(
        screen.getByText("I cosigned this input by Example Coalition on MAPLE:")
      ).toBeInTheDocument()
      expect(screen.getByText("The letter.")).toBeInTheDocument()
      // The reader is copied, and replies go to them.
      expect(screen.getAllByText("gina@example.org").length).toBeGreaterThan(1)
      await act(async () => press("input.cosign"))
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

    it("unticks no words when they go to add their voice", () => {
      const edit = editing({
        draft: { cosignOfId: "p1", content: "" }
      } as Partial<UseEditConferenceTestimony>)
      const onStep = jest.fn()
      const { rerender } = mount(edit, "write", { onStep })
      fireEvent.click(
        screen.getByRole("checkbox", { name: "input.cosign_no_words_label" })
      )
      const at = (step: Step) =>
        rerender(
          <CosignForm
            edit={edit}
            parent={parent}
            court={194}
            conferenceId="H1-S1"
            subject="Phone-Free Schools"
            conferees={conferees}
            step={step}
            onStep={onStep}
            onCancel={jest.fn()}
            onPosted={jest.fn()}
          />
        )
      at("review")
      press("review.add_line")
      expect(onStep).toHaveBeenCalledWith("write")
      at("write")
      expect(screen.getByRole("textbox")).toBeEnabled()
      expect(screen.getByRole("textbox")).toHaveFocus()
    })

    it("puts the caret after the words on the way back to them", () => {
      const edit = editing({ draft } as Partial<UseEditConferenceTestimony>)
      const { rerender } = mount(edit, "review")
      rerender(
        <CosignForm
          edit={edit}
          parent={parent}
          court={194}
          conferenceId="H1-S1"
          subject="Phone-Free Schools"
          conferees={conferees}
          step="write"
          onStep={jest.fn()}
          onCancel={jest.fn()}
          onPosted={jest.fn()}
        />
      )
      const field = screen.getByRole("textbox") as HTMLTextAreaElement
      expect(field).toHaveFocus()
      expect(field.selectionStart).toBe("My note.".length)
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
      // No letter to preview.
      expect(screen.queryByText("review.from")).not.toBeInTheDocument()
      await act(async () => press("input.cosign"))
      expect(edit.publishTestimony.execute).toHaveBeenCalled()
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

  describe("editing a posted cosign", () => {
    const publication = {
      id: "c1",
      cosignOfId: "p1",
      position: "passSenateVersion",
      content: "Before."
    }

    it("changes its words alone, and goes to review to post them", () => {
      const onStep = jest.fn()
      mount(
        editing({ publication } as Partial<UseEditConferenceTestimony>),
        "write",
        { onStep }
      )
      expect(screen.getByRole("textbox")).toHaveValue("Before.")
      // No way to pick another position, to leave the parent, or to post
      // without seeing the letter.
      expect(
        screen.queryByRole("button", { name: /input\.position\./ })
      ).not.toBeInTheDocument()
      expect(screen.queryByText("publish.reasonLabel")).not.toBeInTheDocument()
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "After." }
      })
      press("input.cosign_review")
      expect(onStep).toHaveBeenCalledWith("review")
    })

    it("asks for a reason for the change at review", () => {
      mount(
        editing({
          publication,
          draft: { cosignOfId: "p1", content: "After." }
        } as Partial<UseEditConferenceTestimony>),
        "review"
      )
      const send = screen.getByRole("button", {
        name: "input.cosign"
      })
      expect(send).toBeDisabled()
      fireEvent.change(
        screen.getByPlaceholderText("publish.reasonPlaceholder"),
        { target: { value: "Clearer" } }
      )
      expect(send).toBeEnabled()
    })

    it("posts the change with its reason", async () => {
      const edit = editing({
        publication,
        draft: { cosignOfId: "p1", content: "After.", editReason: "Clearer" }
      } as Partial<UseEditConferenceTestimony>)
      const onPosted = jest.fn()
      mount(edit, "review", { onPosted })
      await act(async () => press("input.cosign"))
      expect(edit.publishTestimony.execute).toHaveBeenCalled()
      expect(onPosted).toHaveBeenCalled()
      // The form stays mounted, so the next edit starts without this reason.
      expect(
        screen.getByPlaceholderText("publish.reasonPlaceholder")
      ).toHaveValue("")
    })

    it("cannot post it unchanged", () => {
      mount(
        editing({
          publication,
          draft: { cosignOfId: "p1", content: "Before." }
        } as Partial<UseEditConferenceTestimony>),
        "review"
      )
      expect(
        screen.getByRole("button", { name: "input.cosign" })
      ).toBeDisabled()
      expect(screen.queryByText("publish.reasonLabel")).not.toBeInTheDocument()
    })
  })
})
