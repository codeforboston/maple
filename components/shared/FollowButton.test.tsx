import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BaseFollowButton } from "./FollowButton"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

const push = jest.fn()
jest.mock("next/router", () => ({
  useRouter: () => ({ push, asPath: "/testimony/abc/1" })
}))

let uid: string | undefined
jest.mock("../auth", () => ({
  useAuth: () => ({ user: uid ? { uid } : null })
}))

describe("BaseFollowButton", () => {
  beforeEach(() => {
    push.mockClear()
    uid = undefined
  })

  it("sends a logged-out visitor to login instead of following", async () => {
    const followAction = jest.fn()
    render(
      <BaseFollowButton
        topicName="bill-194-H1"
        followAction={followAction}
        unfollowAction={jest.fn()}
      />
    )

    await userEvent.click(screen.getByRole("button"))

    expect(followAction).not.toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith("/login?redirect=%2Ftestimony%2Fabc%2F1")
  })

  it("follows when a logged-in user clicks the button", async () => {
    uid = "user-1"
    const followAction = jest.fn().mockResolvedValue(undefined)
    render(
      <BaseFollowButton
        topicName="bill-194-H1"
        followAction={followAction}
        unfollowAction={jest.fn()}
      />
    )

    await userEvent.click(screen.getByRole("button"))

    expect(followAction).toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })
})
