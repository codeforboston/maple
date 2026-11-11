import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { doc, getDoc, getFirestore } from "firebase/firestore"
import { MemberContent } from "components/db"
import { MemberBillSummary } from "functions/src/members/memberBillSummary"
import { BillsTab } from "../BillsTab"

jest.mock("firebase/firestore", () => ({
  doc: jest.fn((_db, path) => ({ path })),
  getDoc: jest.fn(),
  getFirestore: jest.fn(() => ({ type: "db" }))
}))

jest.mock("./BillsTabContainer", () => ({
  BillsTabContainer: ({ summary }: { summary: MemberBillSummary }) =>
    React.createElement(
      "div",
      { "data-testid": "bill-summary" },
      JSON.stringify(summary)
    )
}))

const makeSnapshot = (id: string, data: Record<string, unknown>) => ({
  id,
  exists: () => true,
  data: () => data,
  get: (field: string) => data[field]
})

const summary: MemberBillSummary = {
  schemaVersion: 2,
  all: { count: 3, topics: [] },
  sponsored: { count: 2, topics: [] },
  cosponsored: { count: 1, topics: [] },
  recentSponsoredBills: [{ id: "sponsored-1", title: "Sponsored", topic: "" }]
}

describe("BillsTab", () => {
  const member = {
    GeneralCourtNumber: 194,
    MemberCode: "ABC123"
  } as unknown as MemberContent

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("loads the precomputed summary with a single Firestore read", async () => {
    ;(getDoc as jest.Mock).mockResolvedValue(makeSnapshot("ABC123", summary))

    render(<BillsTab member={member} />)

    await waitFor(() => {
      expect(screen.getByTestId("bill-summary").textContent).toBe(
        JSON.stringify(summary)
      )
    })

    expect(getFirestore).toHaveBeenCalledTimes(1)
    expect(doc).toHaveBeenCalledWith(
      { type: "db" },
      "generalCourts/194/memberBillSummaries/ABC123"
    )
    expect(getDoc).toHaveBeenCalledTimes(1)
  })

  it("falls back to member and bill reads for an older summary schema", async () => {
    ;(getDoc as jest.Mock)
      .mockResolvedValueOnce(
        makeSnapshot("ABC123", {
          all: { count: 0, topics: [] },
          sponsored: { count: 0, topics: [] },
          cosponsored: { count: 0, topics: [] },
          recentSponsoredBills: []
        })
      )
      .mockResolvedValueOnce(
        makeSnapshot("ABC123", {
          content: {
            SponsoredBills: ["sponsored-1", "shared-1"],
            CoSponsoredBills: ["cosponsored-1", "shared-1"]
          }
        })
      )
      .mockImplementation(async (reference: { path: string }) =>
        makeSnapshot(reference.path.split("/").pop() ?? "", {
          content: { Title: "Bill title" },
          topics: [{ category: "Education", topic: "K-12" }]
        })
      )

    render(<BillsTab member={member} />)

    await waitFor(() => {
      const actual = JSON.parse(
        screen.getByTestId("bill-summary").textContent || "{}"
      )
      expect(actual.all.count).toBe(3)
      expect(actual.sponsored.count).toBe(2)
      expect(actual.cosponsored.count).toBe(1)
    })

    expect(getDoc).toHaveBeenCalledTimes(5)
  })

  it("shows an error when a Firestore read fails", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation()
    ;(getDoc as jest.Mock).mockRejectedValue(new Error("Firestore failed"))

    render(<BillsTab member={member} />)

    expect(await screen.findByText("Error loading bills.")).toBeTruthy()
    consoleError.mockRestore()
  })

  it("does not read Firestore when member identifiers are missing", () => {
    render(<BillsTab member={{} as unknown as MemberContent} />)

    expect(getFirestore).not.toHaveBeenCalled()
    expect(getDoc).not.toHaveBeenCalled()
  })
})
