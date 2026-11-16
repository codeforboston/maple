import "@testing-library/jest-dom"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { FollowContext, OrgFollowStatus } from "../shared/FollowContext"
import { FollowConferenceButton, useConferenceFollow } from "./FollowConference"
import type { ConferenceStatus } from "../../functions/src/conferences/types"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

const push = jest.fn()
jest.mock("next/router", () => ({
  useRouter: () => ({ push, asPath: "/conferences/194/phones" })
}))

const mockFlags = { notifications: true }
jest.mock("../featureFlags", () => ({ useFlags: () => mockFlags }))

let uid: string | undefined
jest.mock("../auth", () => ({
  useAuth: () => ({ user: uid ? { uid } : null })
}))

let followed = false
jest.mock("../shared/FollowingQueries", () => ({
  ...jest.requireActual("../shared/FollowingQueries"),
  followsTopic: jest.fn(async () => followed),
  followConference: jest.fn(async () => {}),
  unfollowConference: jest.fn(async () => {})
}))
const queries = jest.requireMock("../shared/FollowingQueries")

function Harness({ status }: { status: ConferenceStatus }) {
  const follow = useConferenceFollow({ id: "phones", court: 194, status })
  return follow.visible ? (
    <FollowConferenceButton
      following={follow.following}
      toggle={follow.toggle}
    />
  ) : null
}

function Page({ status = "appointed" }: { status?: ConferenceStatus }) {
  const [followStatus, setFollowStatus] = useState<OrgFollowStatus>({})
  return (
    <FollowContext.Provider value={{ followStatus, setFollowStatus }}>
      <Harness status={status} />
    </FollowContext.Provider>
  )
}

describe("following a conference", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    uid = undefined
    followed = false
    mockFlags.notifications = true
  })

  it("sends a signed-out reader to log in", async () => {
    render(<Page />)

    await userEvent.click(screen.getByRole("button", { name: "follow.follow" }))

    expect(queries.followConference).not.toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith(
      "/login?redirect=%2Fconferences%2F194%2Fphones"
    )
  })

  it("follows, then unfollows, the conference on its topic", async () => {
    uid = "reader"
    render(<Page />)

    const button = await screen.findByRole("button", { pressed: false })
    await userEvent.click(button)
    expect(queries.followConference).toHaveBeenCalledWith("reader", {
      id: "phones",
      court: 194
    })
    expect(queries.followsTopic).toHaveBeenCalledWith(
      "reader",
      "conference-194-phones"
    )
    expect(button).toHaveAttribute("aria-pressed", "true")
    expect(button).toHaveTextContent("follow.following")

    await userEvent.click(button)
    expect(queries.unfollowConference).toHaveBeenCalledWith("reader", {
      id: "phones",
      court: 194
    })
    expect(button).toHaveAttribute("aria-pressed", "false")
  })

  it("is hidden on a closed conference the reader doesn't follow", async () => {
    uid = "reader"
    render(<Page status="enacted" />)

    await waitFor(() => expect(queries.followsTopic).toHaveBeenCalled())
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("lets a follower unfollow a closed conference, and take it back", async () => {
    uid = "reader"
    followed = true
    render(<Page status="reportFiled" />)

    const button = await screen.findByRole("button", { pressed: true })
    await userEvent.click(button)
    expect(queries.unfollowConference).toHaveBeenCalled()
    // Still there, so the unfollow can be undone.
    expect(button).toHaveAttribute("aria-pressed", "false")

    await userEvent.click(button)
    expect(queries.followConference).toHaveBeenCalled()
  })

  it("is hidden behind the notifications flag", () => {
    mockFlags.notifications = false
    render(<Page />)

    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })
})
