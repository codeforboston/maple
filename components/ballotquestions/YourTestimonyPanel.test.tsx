import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { YourTestimonyPanel } from "./YourTestimonyPanel"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const messages: Record<string, string> = {
        "yourPerspective.closed":
          "Perspectives are no longer being accepted for this ballot question.",
        "yourPerspective.notAvailable":
          "Perspectives are not available for this ballot question yet.",
        "yourPerspective.title": "Your Perspective"
      }
      return messages[key] ?? key
    }
  })
}))

jest.mock("../publish/hooks", () => ({
  usePanelStatus: () => "ready",
  usePublishState: () => ({
    bill: null,
    ballotQuestionId: null
  })
}))

jest.mock("../publish/panel/EditTestimonyButton", () => ({
  EditTestimonyButton: () => <button>Edit perspective</button>
}))

jest.mock("../publish/panel/TestimonyFormPanel", () => ({
  TestimonyFormPanel: ({
    ballotQuestionId,
    variant
  }: {
    ballotQuestionId?: string
    variant?: string
  }) => (
    <div
      data-testid="testimony-form-panel"
      data-ballot-question-id={ballotQuestionId}
      data-variant={variant}
    />
  )
}))

const bill = {
  id: "H5005",
  court: 194
} as any

const ballotQuestion = {
  id: "25-15",
  ballotStatus: "expectedOnBallot"
} as any

describe("YourTestimonyPanel", () => {
  it("allows ballot question perspectives in expected-on-ballot phase", () => {
    render(<YourTestimonyPanel ballotQuestion={ballotQuestion} bill={bill} />)

    expect(screen.getByText("Your Perspective")).toBeInTheDocument()
    expect(screen.getByTestId("testimony-form-panel")).toHaveAttribute(
      "data-ballot-question-id",
      "25-15"
    )
    expect(screen.getByTestId("testimony-form-panel")).toHaveAttribute(
      "data-variant",
      "ballotQuestion"
    )
    expect(
      screen.queryByRole("link", { name: "Testify on the bill" })
    ).not.toBeInTheDocument()
  })
})
