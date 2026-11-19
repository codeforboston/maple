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
  useRouter: () => ({ asPath: "/conferences/194/a", query: {} })
}))
jest.mock("usehooks-ts", () => ({ useMediaQuery: () => false }))
// react-markdown ships ESM only, and the gist here is empty.
jest.mock("react-markdown", () => ({ __esModule: true, default: () => null }))
jest.mock("../featureFlags", () => ({
  useFlags: () => ({ legislators: false, hearingsAndTranscriptions: true })
}))
jest.mock("../hooks", () => ({ useAppDispatch: () => jest.fn() }))
// Following has its own tests; here it is a switch.
let mockFollowVisible = false
jest.mock("./FollowConference", () => ({
  ...jest.requireActual("./FollowConference"),
  useConferenceFollow: () => ({
    visible: mockFollowVisible,
    following: false,
    toggle: jest.fn()
  })
}))
jest.mock("./input/useFollowedAuthors", () => ({
  useFollowedAuthors: () => new Set()
}))
// The feed is not under test, and its actions reach for the store.
jest.mock("./input/Kebab", () => ({ Kebab: () => null }))
jest.mock("./input/EntryModal", () => ({ EntryModal: () => null }))
// The bill text panel would otherwise read the dev backend.
jest.mock("../db/bills", () => ({ useBill: () => ({ loading: true }) }))

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
  useMember: () => ({ member: undefined }),
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
  status: "appointed" as const,
  covered: true,
  reportBillId: null,
  confereeCounts: { senate: 3, house: 3 },
  analysisUpdatedAt: "2026-11-18"
})
const phoneFree = summary(
  "student-learning-and-mental-health",
  "S2581",
  "H5366"
)
const privacy = summary("data-privacy", "S2619", "H5479")
const notCovered = {
  ...summary("home-care", "S3183", "H4706"),
  covered: false
}

const page = (conference: ConferencePageProps["conference"]) => ({
  conference,
  conferences: [phoneFree, privacy, notCovered],
  conferees: [],
  hearings: [],
  gist: null,
  differences: [],
  similarities: [],
  testimonyCount: 0
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

  describe("the not covered section", () => {
    // The rail's: the picker's menu holds a copy only once it is opened.
    const expanded = (c: HTMLElement) =>
      [...c.querySelectorAll("[data-section] > button")].map(
        b => b.getAttribute("aria-expanded") === "true"
      )

    it("starts collapsed on an active conference", () => {
      const { container } = render(<ConferenceDetails {...page(privacy)} />)
      expect(expanded(container)).toEqual([false])
    })

    it("stays collapsed when moving to a conference in it", () => {
      const { container, rerender } = render(
        <ConferenceDetails {...page(privacy)} />
      )
      rerender(<ConferenceDetails {...page(notCovered)} />)
      expect(expanded(container)).toEqual([false])
    })

    it("stays as the user left it when moving between active conferences", () => {
      const { container, rerender } = render(
        <ConferenceDetails {...page(privacy)} />
      )
      fireEvent.click(container.querySelector("[data-section] > button")!)

      rerender(<ConferenceDetails {...page(phoneFree)} />)
      expect(expanded(container)).toEqual([true])
    })
  })
})
