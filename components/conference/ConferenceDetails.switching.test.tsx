import "@testing-library/jest-dom"
import { fireEvent, render } from "@testing-library/react"
import { useState } from "react"
import { ConferenceDetails } from "./ConferenceDetails"
import type { ConferencePageProps } from "./types"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    // The hero's steps are the one array.
    t: (key: string, opts?: { returnObjects?: boolean }) =>
      opts?.returnObjects ? [] : key,
    i18n: { language: "en" }
  }),
  Trans: () => null
}))
jest.mock("next/router", () => ({
  __esModule: true,
  default: { events: { on: () => {} } },
  useRouter: () => ({ asPath: "/conferences/194/a" })
}))
jest.mock("usehooks-ts", () => ({ useMediaQuery: () => false }))
jest.mock("../featureFlags", () => ({
  useFlags: () => ({ legislators: false, hearingsAndTranscriptions: true })
}))
jest.mock("../hooks", () => ({ useAppDispatch: () => jest.fn() }))
jest.mock("./input/useFollowedAuthors", () => ({
  useFollowedAuthors: () => new Set()
}))
// The feed is not under test, and its actions reach for the store.
jest.mock("./input/Kebab", () => ({ Kebab: () => null }))
jest.mock("./input/EntryModal", () => ({ EntryModal: () => null }))

jest.mock("../auth", () => ({
  useAuth: () => ({
    user: { uid: "u1", emailVerified: true },
    authenticated: true,
    claims: { role: "user" }
  })
}))

/** The conference each mount of the draft hook was first given. The real hook
 * fixes its user, bill and conference when it mounts and ignores later
 * arguments, so a panel that outlives a change of conference keeps filing on
 * the old one. */
const mounted: string[] = []
jest.mock("../db", () => ({
  useProfile: () => ({ profile: {} }),
  hasDraftChanged: () => false,
  useConferenceTestimony: () => ({ items: [], loading: false }),
  useEditConferenceTestimony: (
    _uid: string,
    _court: number,
    _billId: string,
    conferenceId: string
  ) => {
    useState(() => mounted.push(conferenceId))
    const noop = { execute: async () => {}, error: undefined, loading: false }
    return {
      loading: false,
      draftLoading: false,
      saveDraft: noop,
      publishTestimony: noop,
      discardDraft: noop
    }
  }
}))

class Observer {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.assign(global, { ResizeObserver: Observer })

const summary = (id: string, senate: string, house: string) => ({
  id,
  court: 194,
  name: id,
  title: id,
  senateBillId: senate,
  houseBillId: house,
  canonicalBillId: senate,
  status: "appointed" as const
})
const phoneFree = summary(
  "student-learning-and-mental-health",
  "S2581",
  "H5366"
)
const privacy = summary("data-privacy", "S2619", "H5479")

const page = (conference: ConferencePageProps["conference"]) => ({
  conference,
  conferences: [phoneFree, privacy],
  conferees: [],
  hearings: []
})

describe("moving between conferences", () => {
  beforeEach(() => {
    mounted.length = 0
  })

  it("starts the panel clean on the new conference", () => {
    const { container, rerender } = render(
      <ConferenceDetails {...page(phoneFree)} />
    )
    const field = () => container.querySelector("textarea")!
    fireEvent.change(field(), { target: { value: "I love the house" } })
    expect(field()).toHaveValue("I love the house")

    rerender(<ConferenceDetails {...page(privacy)} />)

    // Words typed for one conference are not offered on another...
    expect(field()).toHaveValue("")
    // ...and the draft hook was mounted afresh, so it files on the new one.
    expect(mounted).toEqual([phoneFree.id, privacy.id])
  })
})
