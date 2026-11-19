import "@testing-library/jest-dom"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useState } from "react"
import type {
  ConferenceTestimony,
  ConferenceWorkingDraft,
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
const saved = jest.fn()
const published = jest.fn()
beforeEach(() => {
  mockProfile.current = { fullName: "Gina K.", ...legislators }
  saved.mockReset()
  published.mockReset().mockResolvedValue(undefined)
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

type Start = Partial<Pick<UseEditConferenceTestimony, "draft" | "publication">>
type More = {
  start?: Start
  onStep?: jest.Mock
  onPosted?: jest.Mock
  publishError?: Error
}

/** The form on the edit hook as it drives it: a save lands as the draft, as
 * its snapshot would, and each call is recorded. */
function Form({
  step,
  start = {},
  onStep,
  onPosted,
  publishError
}: More & { step: Step }) {
  const [draft, setDraft] = useState(start.draft)
  const edit = {
    loading: false,
    draftLoading: false,
    ...start,
    draft,
    saveDraft: {
      execute: async (request: ConferenceWorkingDraft) => {
        saved(request)
        setDraft(request)
      }
    },
    publishTestimony: { execute: published, error: publishError }
  } as unknown as UseEditConferenceTestimony
  return (
    <CosignForm
      edit={edit}
      parent={parent}
      court={194}
      conferenceId="H1-S1"
      subject="Phone-Free Schools"
      conferees={conferees}
      step={step}
      onStep={onStep ?? jest.fn()}
      onCancel={jest.fn()}
      onPosted={onPosted ?? jest.fn()}
    />
  )
}

const mount = (step: Step, more: More = {}) =>
  render(<Form step={step} {...more} />)

/** Writes `words` as the cosign's note and goes on to review. */
const compose = (words: string, more: More = {}) => {
  const view = mount("write", more)
  fireEvent.change(screen.getByRole("textbox"), { target: { value: words } })
  view.rerender(<Form step="review" {...more} />)
  return view
}

const press = (name: string) =>
  fireEvent.click(screen.getByRole("button", { name }))

describe("CosignForm", () => {
  it("asks the reader to say they have read it before going on", () => {
    const onStep = jest.fn()
    mount("confirm", { onStep })
    expect(screen.getByText("Example Coalition")).toBeInTheDocument()
    press("input.cosign_continue")
    expect(onStep).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole("checkbox"))
    press("input.cosign_continue")
    expect(onStep).toHaveBeenCalledWith("write")
    // Agreeing keeps nothing; only Post writes.
    expect(saved).not.toHaveBeenCalled()
  })

  it("does not start from a note drafted before", () => {
    mount("write", {
      start: {
        draft: { cosignOfId: "p1", content: "My note." }
      } as Start
    })
    expect(screen.getByRole("textbox")).toHaveValue("")
  })

  it("asks for words or for none before filing", () => {
    const onStep = jest.fn()
    mount("write", { onStep })
    press("input.cosign_review")
    expect(onStep).not.toHaveBeenCalled()

    const noWords = () =>
      screen.getByRole("checkbox", { name: "input.cosign_no_words_label" })
    fireEvent.click(noWords())
    // Off while they've said no words.
    expect(screen.getByRole("textbox")).toBeDisabled()
    press("input.cosign_review")
    expect(onStep).toHaveBeenCalledWith("review")
    expect(published).not.toHaveBeenCalled()

    // Unticking the box is the way back to writing.
    fireEvent.click(noWords())
    expect(screen.getByRole("textbox")).toBeEnabled()
  })

  describe("review", () => {
    it("shows where the cosign goes and the letter as sent, and posts it", async () => {
      const onPosted = jest.fn()
      compose("My note.", { onPosted })
      expect(screen.getByText("review.goes_cosign")).toBeInTheDocument()
      // The cosign as MAPLE will show it first, and the letter a switch away.
      expect(
        screen.getByRole("button", { name: "review.preview_web" })
      ).toHaveAttribute("aria-pressed", "true")
      press("review.preview_email")
      expect(
        screen.getByText("Dear Representative Rae Rep and Senator Sam Sen,")
      ).toBeInTheDocument()
      expect(
        screen.getByText("I cosigned this input by Example Coalition on MAPLE:")
      ).toBeInTheDocument()
      expect(screen.getByText("The letter.")).toBeInTheDocument()
      // The reader is copied, and replies go to them.
      expect(screen.getAllByText("gina@example.org").length).toBeGreaterThan(1)
      press("input.cosign")
      await waitFor(() => expect(onPosted).toHaveBeenCalled())
      // Post writes the cosign, of the parent at its position, then publishes.
      expect(saved).toHaveBeenCalledTimes(1)
      expect(saved).toHaveBeenCalledWith(
        expect.objectContaining({
          cosignOfId: "p1",
          cosignOfAuthorUid: "org",
          position: "passSenateVersion",
          content: "My note."
        })
      )
      expect(published).toHaveBeenCalledTimes(1)
    })

    it("tells a cosign without words of its own that it still counts", () => {
      const onStep = jest.fn()
      mount("review", { onStep })
      expect(screen.getByText(/review\.no_line/)).toBeInTheDocument()
      press("review.add_line")
      expect(onStep).toHaveBeenCalledWith("write")
    })

    it("unticks no words when they go to add their voice", () => {
      const onStep = jest.fn()
      const { rerender } = mount("write", { onStep })
      fireEvent.click(
        screen.getByRole("checkbox", { name: "input.cosign_no_words_label" })
      )
      rerender(<Form step="review" onStep={onStep} />)
      press("review.add_line")
      expect(onStep).toHaveBeenCalledWith("write")
      rerender(<Form step="write" onStep={onStep} />)
      expect(screen.getByRole("textbox")).toBeEnabled()
      expect(screen.getByRole("textbox")).toHaveFocus()
    })

    it("puts the caret after the words on the way back to them", () => {
      const { rerender } = compose("My note.")
      rerender(<Form step="write" />)
      const field = screen.getByRole("textbox") as HTMLTextAreaElement
      expect(field).toHaveFocus()
      expect(field.selectionStart).toBe("My note.".length)
    })

    it("says no banner over a cosign with words", () => {
      compose("My note.")
      expect(screen.queryByText(/review\.no_line/)).not.toBeInTheDocument()
    })

    it("says so, and sends no letter, when MAPLE has no one to notify", async () => {
      mockProfile.current = { fullName: "Gina K." }
      compose("My note.")
      expect(screen.getByText("review.emailed_none")).toBeInTheDocument()
      // No letter to preview.
      expect(screen.queryByText("review.from")).not.toBeInTheDocument()
      press("input.cosign")
      await waitFor(() => expect(published).toHaveBeenCalled())
    })
  })

  it.each([
    ["cosignParentGone", "input.cosign_parent_gone"],
    ["conferenceClosed", "input.cosign_closed"],
    ["any other", "input.error"]
  ])("words %s refusal for the reader", (refusal, message) => {
    const publishError = Object.assign(new Error("refused"), {
      details: { refusal }
    })
    mount("write", { publishError })
    expect(screen.getByRole("alert")).toHaveTextContent(message)
  })

  describe("editing a posted cosign", () => {
    const start = {
      publication: {
        id: "c1",
        cosignOfId: "p1",
        position: "passSenateVersion",
        content: "Before."
      }
    } as Start

    it("changes its words alone, and goes to review to post them", () => {
      const onStep = jest.fn()
      mount("write", { start, onStep })
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
      compose("After.", { start })
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
      const onPosted = jest.fn()
      compose("After.", { start, onPosted })
      fireEvent.change(
        screen.getByPlaceholderText("publish.reasonPlaceholder"),
        { target: { value: "Clearer" } }
      )
      press("input.cosign")
      await waitFor(() => expect(onPosted).toHaveBeenCalled())
      expect(saved).toHaveBeenCalledWith(
        expect.objectContaining({ content: "After.", editReason: "Clearer" })
      )
      // The form stays mounted, so the next edit starts without this reason.
      expect(
        screen.getByPlaceholderText("publish.reasonPlaceholder")
      ).toHaveValue("")
    })

    it("cannot post it unchanged", () => {
      mount("review", { start })
      expect(
        screen.getByRole("button", { name: "input.cosign" })
      ).toBeDisabled()
      expect(screen.queryByText("publish.reasonLabel")).not.toBeInTheDocument()
    })
  })
})
