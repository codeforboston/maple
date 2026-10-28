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
  useAuth: () => ({ claims: { role: "user" } })
}))
jest.mock("components/db", () => ({
  useProfile: () => ({ profile: { fullName: "Gina K." } })
}))

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

  it("asks for words or for none before filing", async () => {
    const draft = { cosignOfId: "p1", content: "" }
    const edit = editing({ draft } as Partial<UseEditConferenceTestimony>)
    const onPosted = jest.fn()
    mount(edit, "write", { onPosted })
    press("input.cosign")
    expect(edit.publishTestimony.execute).not.toHaveBeenCalled()

    fireEvent.click(
      screen.getByRole("checkbox", { name: "input.cosign_no_words_label" })
    )
    expect(screen.getByRole("textbox")).toBeDisabled()
    await act(async () => press("input.cosign"))
    expect(edit.publishTestimony.execute).toHaveBeenCalled()
    expect(onPosted).toHaveBeenCalled()
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
