import React from "react"
import { RemoveTestimonyForm } from "components/moderation/RemoveTestimony"
import { createFakeTestimonyReport } from "./setUp/MockRecords"
import { cleanup, render, act } from "@testing-library/react"
import { screen } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import { AdminContext } from "react-admin"
import { ReportModal } from "components/TestimonyCard/ReportModal"
import { RequestDeleteOwnTestimonyModal } from "components/TestimonyCard/ReportModal"

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

    userEvent.click(screen.getByLabelText(/remove/i))
    expect(screen.getByLabelText(/remove/i)).toHaveProperty("checked", true)
    expect(screen.getByLabelText(/allow/i)).toHaveProperty("checked", false)

    userEvent.click(screen.getByLabelText(/allow/i))
    expect(screen.getByLabelText(/remove/i)).toHaveProperty("checked", false)

    expect(screen.getByLabelText(/Reason/i)).toBeInstanceOf(HTMLTextAreaElement)

    const textBox = screen.getByLabelText(/Reason/i)
    userEvent.type(textBox, "this is a textBox")

    cleanup()
  })
})
