import React from "react"
import { RemoveTestimonyForm } from "components/moderation/RemoveTestimony"
import { createFakeTestimonyReport } from "./setUp/MockRecords"
import { cleanup, render, act } from "@testing-library/react"
import { screen } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import { AdminContext } from "react-admin"
import { BillInfoHeader } from "components/TestimonyCard/BillInfoHeader"
import { ReportModal } from "components/TestimonyCard/ReportModal"
import { RequestDeleteOwnTestimonyModal } from "components/TestimonyCard/ReportModal"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

describe("report testimony modal", () => {
  const setIsReporting = jest.fn()
  const mutateReport = jest.fn()
  it("renders report modal", () => {
    render(
      <ReportModal
        reasons={[
          "Personal Information",
          "Offensive",
          "Violent",
          "Spam",
          "Phishing"
        ]}
        onClose={setIsReporting}
        onReport={mutateReport}
        isLoading={false}
        additionalInformationLabel={""}
      />
    )
  })

  it("renders request delete own testimony modal", () => {
    render(
      <RequestDeleteOwnTestimonyModal
        onClose={setIsReporting}
        onReport={mutateReport}
        isLoading={false}
      />
    )
  })
})

describe("remove testimony", () => {
  const { user, testimony, report } = createFakeTestimonyReport()

  it("renders without crashing", async () => {
    render(
      <AdminContext>
        <RemoveTestimonyForm report={report} />
      </AdminContext>
    )
    expect(screen.getByText(/remove/i)).toBeInstanceOf(HTMLLabelElement)

    cleanup()
  })

  it("displays remove and allow options", async () => {
    render(
      <AdminContext>
        <RemoveTestimonyForm report={report} />
      </AdminContext>
    )

    expect(screen.getByLabelText(/remove/i)).toBeInstanceOf(HTMLInputElement)
    expect(screen.getByLabelText(/allow/i)).toBeInstanceOf(HTMLInputElement)
    cleanup()
  })

  it("takes inputs", async () => {
    render(
      <AdminContext>
        <RemoveTestimonyForm report={report} />
      </AdminContext>
    )

    expect(screen.getByLabelText(/remove/i)).toBeInstanceOf(HTMLInputElement)
    expect(
      screen.getByLabelText(/remove/i).parentElement?.parentElement
    ).toBeInstanceOf(HTMLDivElement)

    await userEvent.click(screen.getByLabelText(/remove/i))
    expect(screen.getByLabelText(/remove/i)).toHaveProperty("checked", true)
    expect(screen.getByLabelText(/allow/i)).toHaveProperty("checked", false)

    await userEvent.click(screen.getByLabelText(/allow/i))
    expect(screen.getByLabelText(/remove/i)).toHaveProperty("checked", false)

    expect(screen.getByLabelText(/Reason/i)).toBeInstanceOf(HTMLTextAreaElement)

    const textBox = screen.getByLabelText(/Reason/i)
    await userEvent.type(textBox, "this is a textBox")

    cleanup()
  })
})

describe("profile testimony header", () => {
  it("links ballot-question testimony to the ballot question page", () => {
    render(
      <BillInfoHeader
        testimony={
          {
            billId: "H123",
            billTitle: "A Test Ballot Question",
            ballotQuestionId: "25-14",
            position: "endorse"
          } as any
        }
        billLink="/bills/194/H123"
        publishedDate="3/24/2026"
      />
    )

    const link = screen.getByRole("link", { name: "Ballot Question 25-14" })
    expect(link.getAttribute("href")).toBe("/ballotQuestions/25-14")
    expect(screen.getByText("A Test Ballot Question")).toBeTruthy()
  })
})
