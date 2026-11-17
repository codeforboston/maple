import "@testing-library/jest-dom"
import { act, fireEvent, render, screen } from "@testing-library/react"
import type { UseEditConferenceTestimony } from "components/db"
import { InputForm } from "./InputForm"
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

beforeEach(() => {
  mockProfile.current = {
    fullName: "Gina K.",
    representative: { id: "r1", name: "Rae Rep", district: "3rd Middlesex" },
    senator: { id: "s1", name: "Sam Sen", district: "Middlesex and Suffolk" }
  }
})

const editing = (overrides: Record<string, unknown> = {}) =>
  ({
    saveDraft: { execute: jest.fn().mockResolvedValue(undefined) },
    publishTestimony: { execute: jest.fn().mockResolvedValue(undefined) },
    discardDraft: { execute: jest.fn() },
    loading: false,
    draftLoading: false,
    draft: { position: "passSomething", content: "Pass it, please." },
    ...overrides
  } as unknown as UseEditConferenceTestimony)

const review = (edit: UseEditConferenceTestimony) =>
  render(
    <InputForm
      court={194}
      conferenceId="H1-S1"
      conferees={conferees}
      edit={edit}
      subject="Phone-Free Schools"
      step="review"
      onStep={jest.fn()}
      onCancel={jest.fn()}
      onPosted={jest.fn()}
    />
  )

const write = (edit: UseEditConferenceTestimony) =>
  render(
    <InputForm
      court={194}
      conferenceId="H1-S1"
      conferees={conferees}
      edit={edit}
      subject="Phone-Free Schools"
      step="write"
      onStep={jest.fn()}
      onCancel={jest.fn()}
      onPosted={jest.fn()}
    />
  )

describe("InputForm", () => {
  it("promises the email to legislators only when the profile has some", () => {
    const { unmount } = write(editing())
    expect(screen.getByText("input.delivery_note")).toBeInTheDocument()
    unmount()

    mockProfile.current = { fullName: "Gina K." }
    write(editing())
    expect(screen.getByText("input.delivery_note_weekly")).toBeInTheDocument()
    expect(screen.queryByText("input.delivery_note")).not.toBeInTheDocument()
  })

  it("leaves a cosign's draft alone while it sits behind a closed panel", () => {
    jest.useFakeTimers()
    const edit = {
      saveDraft: { execute: jest.fn().mockResolvedValue(undefined) },
      publishTestimony: { execute: jest.fn() },
      discardDraft: { execute: jest.fn() },
      loading: false,
      draftLoading: false,
      draft: {
        cosignOfId: "p1",
        position: "passSenateVersion",
        content: "My note."
      }
    } as unknown as UseEditConferenceTestimony
    render(
      <InputForm
        court={194}
        conferenceId="H1-S1"
        conferees={[]}
        edit={edit}
        subject="Phone-Free Schools"
        step="write"
        onStep={jest.fn()}
        onCancel={jest.fn()}
        onPosted={jest.fn()}
      />
    )
    act(() => {
      jest.advanceTimersByTime(5000)
    })
    expect(edit.saveDraft.execute).not.toHaveBeenCalled()
    jest.useRealTimers()
  })

  describe("review", () => {
    it("shows where the input goes and the letter as it will be sent", () => {
      review(editing())
      expect(screen.getByText("review.goes_input")).toBeInTheDocument()
      // The input as MAPLE will show it first, and the letter a switch away.
      expect(
        screen.getByRole("button", { name: "review.preview_web" })
      ).toHaveAttribute("aria-pressed", "true")
      fireEvent.click(
        screen.getByRole("button", { name: "review.preview_email" })
      )
      const greeting = screen.getByText(
        "Dear Representative Rae Rep and Senator Sam Sen,"
      )
      expect(greeting.parentElement).toHaveTextContent("Pass it, please.")
      expect(
        screen.getByRole("button", { name: "review.submit" })
      ).toBeInTheDocument()
    })

    it("marks the letter updated only when an earlier one is on record", () => {
      const publication = { id: "t1", position: "passSomething", content: "" }
      const edit = editing({
        publication
      } as Partial<UseEditConferenceTestimony>)
      const email = () =>
        fireEvent.click(
          screen.getByRole("button", { name: "review.preview_email" })
        )
      const { unmount } = review(edit)
      email()
      expect(screen.getByText(/^Phone-Free Schools: /)).not.toHaveTextContent(
        "(updated)"
      )
      unmount()

      mockOnRecord.add("t1")
      review(edit)
      email()
      expect(screen.getByText(/^Phone-Free Schools: /)).toHaveTextContent(
        /\(updated\)$/
      )
      mockOnRecord.clear()
    })

    it("says no one will be emailed when the profile has no legislators", () => {
      mockProfile.current = { fullName: "Gina K." }
      review(editing())
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

    it("starts the next edit without the last one's reason", async () => {
      const edit = editing({
        publication: { id: "t1", position: "passSomething", content: "Pass." },
        draft: {
          position: "passSomething",
          content: "Pass it, please.",
          editReason: "Clearer"
        }
      })
      review(edit)
      const reason = screen.getByPlaceholderText("publish.reasonPlaceholder")
      expect(reason).toHaveValue("Clearer")
      await act(async () =>
        fireEvent.click(screen.getByRole("button", { name: "review.submit" }))
      )
      expect(edit.publishTestimony.execute).toHaveBeenCalled()
      expect(reason).toHaveValue("")
    })
  })
})
