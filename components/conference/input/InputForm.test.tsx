import "@testing-library/jest-dom"
import { act, fireEvent, render, screen } from "@testing-library/react"
import type { UseEditConferenceTestimony } from "components/db"
import { InputForm } from "./InputForm"

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
  useMember: () => ({ member: undefined })
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
      conferees={["CC", "BF"]}
      edit={edit}
      subject="Phone-Free Schools"
      step="review"
      onStep={jest.fn()}
      onCancel={jest.fn()}
      onPosted={jest.fn()}
    />
  )

describe("InputForm", () => {
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
        conferees={[]}
        edit={edit}
        subject="Phone-Free Schools"
        step="compose"
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
      expect(
        screen.getByText("Dear Representative Rae Rep and Senator Sam Sen,")
      ).toBeInTheDocument()
      expect(screen.getByText("Pass it, please.")).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "review.post_and_send" })
      ).toBeInTheDocument()
    })

    it("says no one will be emailed when the profile has no legislators", () => {
      mockProfile.current = { fullName: "Gina K." }
      review(editing())
      expect(screen.getByText("review.emailed_none")).toBeInTheDocument()
      expect(screen.queryByText("review.preview_label")).not.toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "input.post" })
      ).toBeInTheDocument()
    })

    it("keeps another reply-to address on the draft, for this letter alone", async () => {
      jest.useFakeTimers()
      const edit = editing()
      review(edit)
      fireEvent.click(screen.getByRole("button", { name: "review.use_other" }))
      fireEvent.change(screen.getByLabelText("review.reply_to_label"), {
        target: { value: "gina.work@example.org" }
      })
      fireEvent.click(screen.getByRole("button", { name: "review.done" }))
      await act(async () => {
        jest.advanceTimersByTime(2000)
      })
      expect(edit.saveDraft.execute).toHaveBeenCalledWith(
        expect.objectContaining({ replyTo: "gina.work@example.org" })
      )
      jest.useRealTimers()
    })
  })
})
