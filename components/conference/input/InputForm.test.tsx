import "@testing-library/jest-dom"
import { act, render } from "@testing-library/react"
import type { UseEditConferenceTestimony } from "components/db"
import { InputForm } from "./InputForm"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
  Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>
}))

jest.mock("components/auth", () => ({
  useAuth: () => ({ claims: { role: "user" } })
}))
jest.mock("components/db", () => ({
  useProfile: () => ({ profile: { fullName: "Gina K." } })
}))

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
        uid="u1"
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
})
