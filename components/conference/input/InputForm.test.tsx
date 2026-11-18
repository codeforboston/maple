import "@testing-library/jest-dom"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useState } from "react"
import type {
  ConferenceWorkingDraft,
  UseEditConferenceTestimony
} from "components/db"
import { InputForm, Step } from "./InputForm"
import { conferencePositions } from "./positions"
import type { ConfereeView } from "../types"

// jsdom has none of these, and the review's preview card and its clamp watch
// their width, as in PublicInput.test.tsx.
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
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
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
  hasDraftChanged: () => true
}))
// The testimony ids with a letter on record.
const mockOnRecord = new Set<string>()
jest.mock("components/db/legislatorMail", () => ({
  useLetterOnRecord: (testimonyId?: string) =>
    !!testimonyId && mockOnRecord.has(testimonyId)
}))

const saved = jest.fn()
const published = jest.fn()
// What a save waits on for the server to have it; its snapshot shows first.
let mockAck: Promise<void> = Promise.resolve()
beforeEach(() => {
  mockAck = Promise.resolve()
  mockProfile.current = {
    fullName: "Gina K.",
    representative: { id: "r1", name: "Rae Rep", district: "3rd Middlesex" },
    senator: { id: "s1", name: "Sam Sen", district: "Middlesex and Suffolk" }
  }
  saved.mockReset()
  published.mockReset().mockResolvedValue(undefined)
})

type Start = Partial<Pick<UseEditConferenceTestimony, "draft" | "publication">>

/** The form on the edit hook as it drives it: a save lands as the draft, as
 * its snapshot would, before the server has it, and each call is recorded. */
function Form({
  step,
  start = {},
  onPosted = jest.fn()
}: {
  step: Step
  start?: Start
  onPosted?: () => void
}) {
  const [draft, setDraft] = useState(start.draft)
  const [saving, setSaving] = useState(false)
  const edit = {
    loading: false,
    draftLoading: false,
    ...start,
    draft,
    saveDraft: {
      loading: saving,
      execute: async (request: ConferenceWorkingDraft) => {
        saved(request)
        setSaving(true)
        setDraft(request)
        await mockAck
        setSaving(false)
      }
    },
    publishTestimony: { execute: published }
  } as unknown as UseEditConferenceTestimony
  return (
    <InputForm
      court={194}
      conferenceId="H1-S1"
      conferees={conferees}
      edit={edit}
      subject="Phone-Free Schools"
      step={step}
      onStep={jest.fn()}
      onCancel={jest.fn()}
      onPosted={onPosted}
    />
  )
}

/** Writes `words` and goes on to review. */
const compose = (
  words = "Pass it, please.",
  start: Start = {},
  onPosted?: () => void
) => {
  const view = render(<Form step="write" start={start} onPosted={onPosted} />)
  fireEvent.change(screen.getByRole("textbox"), { target: { value: words } })
  view.rerender(<Form step="review" start={start} onPosted={onPosted} />)
  return view
}

/** Switches the review's preview to the letter. */
const email = () =>
  fireEvent.click(screen.getByRole("button", { name: "review.preview_email" }))

describe("InputForm", () => {
  it("promises the email to legislators only when the profile has some", () => {
    const { unmount } = render(<Form step="write" />)
    expect(screen.getByText("input.delivery_note")).toBeInTheDocument()
    unmount()

    mockProfile.current = { fullName: "Gina K." }
    render(<Form step="write" />)
    expect(screen.getByText("input.delivery_note_weekly")).toBeInTheDocument()
    expect(screen.queryByText("input.delivery_note")).not.toBeInTheDocument()
  })

  it.each([
    ["a draft left from before", { draft: { content: "Old words." } }],
    [
      "a posted cosign",
      { publication: { id: "c1", cosignOfId: "p1", content: "My note." } }
    ]
  ])("does not start from %s", (_, start) => {
    render(<Form step="write" start={start as Start} />)
    expect(screen.getByRole("textbox")).toHaveValue("")
  })

  it("starts an edit from what was posted", () => {
    render(
      <Form
        step="write"
        start={
          {
            publication: {
              id: "t1",
              position: "passSomething",
              content: "Pass."
            }
          } as Start
        }
      />
    )
    expect(screen.getByRole("textbox")).toHaveValue("Pass.")
  })

  it("keeps nothing as the reader types", () => {
    jest.useFakeTimers()
    render(<Form step="write" />)
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Pass it, please." }
    })
    act(() => {
      jest.advanceTimersByTime(5000)
    })
    expect(saved).not.toHaveBeenCalled()
    expect(screen.queryByText("input.saved")).not.toBeInTheDocument()
    jest.useRealTimers()
  })

  describe("review", () => {
    it("shows where the input goes and the letter as it will be sent", () => {
      compose()
      expect(screen.getByText("review.goes_input")).toBeInTheDocument()
      // The input as MAPLE will show it first, and the letter a switch away.
      expect(
        screen.getByRole("button", { name: "review.preview_web" })
      ).toHaveAttribute("aria-pressed", "true")
      email()
      const greeting = screen.getByText(
        "Dear Representative Rae Rep and Senator Sam Sen,"
      )
      expect(greeting.parentElement).toHaveTextContent("Pass it, please.")
      expect(
        screen.getByRole("button", { name: "review.submit" })
      ).toBeInTheDocument()
    })

    it("writes what is on screen at Post, then publishes it", async () => {
      const onPosted = jest.fn()
      compose("Pass it, please.", {}, onPosted)
      expect(saved).not.toHaveBeenCalled()
      fireEvent.click(screen.getByRole("button", { name: "review.submit" }))
      await waitFor(() => expect(onPosted).toHaveBeenCalled())
      expect(saved).toHaveBeenCalledTimes(1)
      expect(saved).toHaveBeenCalledWith({
        position: conferencePositions[0],
        content: "Pass it, please.",
        editReason: undefined
      })
      expect(published).toHaveBeenCalledTimes(1)
      expect(saved.mock.invocationCallOrder[0]).toBeLessThan(
        published.mock.invocationCallOrder[0]
      )
    })

    it("publishes only once the server has the write", async () => {
      let ack = () => {}
      mockAck = new Promise(resolve => (ack = resolve))
      const onPosted = jest.fn()
      compose("Pass it, please.", {}, onPosted)
      fireEvent.click(screen.getByRole("button", { name: "review.submit" }))
      await waitFor(() => expect(saved).toHaveBeenCalled())
      expect(published).not.toHaveBeenCalled()
      await act(async () => ack())
      await waitFor(() => expect(onPosted).toHaveBeenCalled())
      expect(saved).toHaveBeenCalledTimes(1)
      expect(published).toHaveBeenCalledTimes(1)
    })

    it("publishes a draft that already holds the words without writing it", async () => {
      // Writing the same words fires no snapshot, so a post would wait on one.
      compose("Pass it, please.", {
        draft: {
          position: conferencePositions[0],
          content: "Pass it, please."
        } as ConferenceWorkingDraft
      })
      fireEvent.click(screen.getByRole("button", { name: "review.submit" }))
      await waitFor(() => expect(published).toHaveBeenCalled())
      expect(saved).not.toHaveBeenCalled()
    })

    it("marks the letter updated only when an earlier one is on record", () => {
      const start = {
        publication: { id: "t1", position: "passSomething", content: "" }
      } as Start
      const { unmount } = compose("Pass it, please.", start)
      email()
      expect(screen.getByText(/^Phone-Free Schools: /)).not.toHaveTextContent(
        "(updated)"
      )
      unmount()

      mockOnRecord.add("t1")
      compose("Pass it, please.", start)
      email()
      expect(screen.getByText(/^Phone-Free Schools: /)).toHaveTextContent(
        /\(updated\)$/
      )
      mockOnRecord.clear()
    })

    it("says no one will be emailed when the profile has no legislators", () => {
      mockProfile.current = { fullName: "Gina K." }
      compose()
      expect(screen.getByText("review.emailed_none")).toBeInTheDocument()
      // No letter, so nothing to switch to: the web preview alone.
      expect(screen.queryByText("review.from")).not.toBeInTheDocument()
      expect(
        screen.queryByRole("button", { name: "review.preview_email" })
      ).not.toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "review.submit" })
      ).toBeInTheDocument()
    })

    it("posts an edit with its reason, and starts the next one without it", async () => {
      compose("Pass it, please.", {
        publication: { id: "t1", position: "passSomething", content: "Pass." }
      } as Start)
      const reason = screen.getByPlaceholderText("publish.reasonPlaceholder")
      fireEvent.change(reason, { target: { value: "Clearer" } })
      fireEvent.click(screen.getByRole("button", { name: "review.submit" }))
      await waitFor(() => expect(published).toHaveBeenCalled())
      expect(saved).toHaveBeenCalledWith(
        expect.objectContaining({ editReason: "Clearer" })
      )
      expect(reason).toHaveValue("")
    })
  })
})
