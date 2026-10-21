import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { doc, getDoc, getFirestore } from "firebase/firestore"
import { MemberContent } from "functions/src/members/types"
import { BillsTab } from "../BillsTab"

jest.mock("firebase/firestore", () => ({
  doc: jest.fn((_db, path) => ({ path })),
  getDoc: jest.fn(),
  getFirestore: jest.fn(() => ({ type: "db" }))
}))

jest.mock("./BillsTabContainer", () => ({
  BillsTabContainer: ({ bills }: { bills: Record<string, { id: string }[]> }) =>
    React.createElement(
      "div",
      { "data-testid": "bill-groups" },
      JSON.stringify({
        all: bills.all.count,
        sponsored: bills.sponsored.count,
        cosponsored: bills.cosponsored.count,
        recentSponsoredBills: bills.recentSponsoredBills
      })
    )
}))

const makeSnapshot = (id: string, data: Record<string, unknown>) => ({
  id,
  exists: () => true,
  data: () => data
})

describe("BillsTab", () => {
  const member = {
    GeneralCourtNumber: 194,
    MemberCode: "ABC123"
  } as MemberContent

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("loads bill groups from one member summary document", async () => {
    const summary = {
      all: { count: 3, topics: [] },
      sponsored: { count: 2, topics: [] },
      cosponsored: { count: 1, topics: [] },
      recentSponsoredBills: [
        { id: "HD2", title: "Recent bill", topic: "Education" }
      ]
    }
    ;(getDoc as jest.Mock).mockResolvedValue(makeSnapshot("ABC123", summary))

    render(<BillsTab member={member} />)

    await waitFor(() => {
      expect(screen.getByTestId("bill-groups").textContent).toBe(
        JSON.stringify({
          all: 3,
          sponsored: 2,
          cosponsored: 1,
          recentSponsoredBills: summary.recentSponsoredBills
        })
      )
    })

    expect(getFirestore).toHaveBeenCalledTimes(1)
    expect(doc).toHaveBeenCalledWith(
      { type: "db" },
      "generalCourts/194/memberBillSummaries/ABC123"
    )
    expect(getDoc).toHaveBeenCalledTimes(1)
  })

  it("renders empty bill groups when the summary does not exist", async () => {
    ;(getDoc as jest.Mock).mockResolvedValue({ exists: () => false })

    render(<BillsTab member={member} />)

    await waitFor(() => {
      expect(screen.getByTestId("bill-groups").textContent).toBe(
        JSON.stringify({
          all: 0,
          sponsored: 0,
          cosponsored: 0,
          recentSponsoredBills: []
        })
      )
    })

    expect(getDoc).toHaveBeenCalledTimes(1)
  })

  it("shows an error when a Firestore read fails", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation()
    ;(getDoc as jest.Mock).mockRejectedValue(new Error("Firestore failed"))

    render(<BillsTab member={member} />)

    expect(await screen.findByText("Error loading bills.")).toBeTruthy()
    consoleError.mockRestore()
  })

  it("does not read Firestore when member identifiers are missing", () => {
    render(<BillsTab member={{} as MemberContent} />)

    expect(getFirestore).not.toHaveBeenCalled()
    expect(getDoc).not.toHaveBeenCalled()
  })
})
