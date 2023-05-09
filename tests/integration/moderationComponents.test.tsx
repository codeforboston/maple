import React from "react"
import { RemoveTestimonyForm } from "components/moderation/RemoveTestimony"
import { createFakeTestimonyReport } from "../../components/moderation/setUp/MockRecords"
import { cleanup, render, act } from "@testing-library/react"
import { screen } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import { AdminContext } from "react-admin"

describe("remove testimony", () => {
  const { user, testimony, report } = createFakeTestimonyReport()

  it("renders without crashing", async () => {
    render(
      <AdminContext>
        <RemoveTestimonyForm report={report} />
      </AdminContext>
    )
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
    expect(screen.getByLabelText(/remove/i)).toHaveProperty('checked', true)
    expect(screen.getByLabelText(/allow/i)).toHaveProperty('checked', false)
    
    userEvent.click(screen.getByLabelText(/allow/i))
    expect(screen.getByLabelText(/remove/i)).toHaveProperty('checked', false)


    expect(screen.getByLabelText(/Reason/i)).toBeInstanceOf(HTMLTextAreaElement)

    const textBox = screen.getByLabelText(/Reason/i)
    userEvent.type(textBox, "this is a textBox")
  })
})
