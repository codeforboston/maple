import "@testing-library/jest-dom"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { FollowContext } from "components/shared/FollowContext"
import { PolicyActions } from "./PolicyActions"

const mockGetBallotQuestion = jest.fn()
const mockFollowsTopic = jest.fn()
const mockFollowBill = jest.fn()
const mockUnfollowBill = jest.fn()
const mockFollowBallotQuestion = jest.fn()
const mockUnfollowBallotQuestion = jest.fn()

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

jest.mock("components/featureFlags", () => ({
  useFlags: () => ({
    notifications: true
  })
}))

jest.mock("components/auth", () => ({
  useAuth: () => ({
    user: { uid: "user-1" }
  })
}))

jest.mock("components/db/api", () => ({
  dbService: () => ({
    getBallotQuestion: mockGetBallotQuestion
  })
}))

jest.mock("./testimonyDetailSlice", () => ({
  useCurrentTestimonyDetails: () => ({
    bill: {
      id: "H123",
      court: 194
    },
    revision: {
      ballotQuestionId: "25-14"
    }
  })
}))

jest.mock("components/shared/FollowingQueries", () => ({
  ballotQuestionTopicName: jest.fn(
    (court: number, id: string) => `ballot-question-${court}-${id}`
  ),
  billTopicName: jest.fn((court: number, id: string) => `bill-${court}-${id}`),
  followBallotQuestion: (...args: unknown[]) =>
    mockFollowBallotQuestion(...args),
  followBill: (...args: unknown[]) => mockFollowBill(...args),
  followsTopic: (...args: unknown[]) => mockFollowsTopic(...args),
  unfollowBallotQuestion: (...args: unknown[]) =>
    mockUnfollowBallotQuestion(...args),
  unfollowBill: (...args: unknown[]) => mockUnfollowBill(...args)
}))

jest.mock("components/publish", () => ({
  formUrl: (
    billId: string,
    court: number,
    page: string,
    ballotQuestionId?: string
  ) =>
    `/submit-testimony?billId=${billId}&court=${court}&page=${page}${
      ballotQuestionId ? `&ballotQuestionId=${ballotQuestionId}` : ""
    }`
}))

describe("PolicyActions", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFollowsTopic.mockResolvedValue(false)
    mockFollowBill.mockResolvedValue(undefined)
    mockUnfollowBill.mockResolvedValue(undefined)
    mockFollowBallotQuestion.mockResolvedValue(undefined)
    mockUnfollowBallotQuestion.mockResolvedValue(undefined)
    mockGetBallotQuestion.mockResolvedValue({
      ballotStatus: "ballot"
    })
  })

  it("uses ballot-question follow behavior for ballot-question testimony", async () => {
    render(
      <FollowContext.Provider
        value={{ followStatus: {}, setFollowStatus: jest.fn() }}
      >
        <PolicyActions
          isReporting={false}
          setReporting={jest.fn()}
          isUser={false}
        />
      </FollowContext.Provider>
    )

    await waitFor(() => {
      expect(mockFollowsTopic).toHaveBeenCalledWith(
        "user-1",
        "ballot-question-194-25-14"
      )
    })

    expect(screen.getByText("Follow Ballot Question 25-14")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Follow Ballot Question 25-14"))

    await waitFor(() => {
      expect(mockFollowBallotQuestion).toHaveBeenCalledWith("user-1", {
        court: 194,
        id: "25-14"
      })
    })
    expect(mockFollowBill).not.toHaveBeenCalled()
  })
})
