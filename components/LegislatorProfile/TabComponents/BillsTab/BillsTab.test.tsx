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
        all: bills.all.map(bill => bill.id),
        sponsored: bills.sponsored.map(bill => bill.id),
        cosponsored: bills.cosponsored.map(bill => bill.id)
      })
    )
}))

const makeSnapshot = (id: string, data: Record<string, unknown>) => ({
  id,
  exists: () => true,
  data: () => data
})

const makeBillData = (title: string) => ({
  content: { Title: title }
})

describe("BillsTab", () => {
  const member = {
    GeneralCourtNumber: 194,
    MemberCode: "ABC123"
  } as MemberContent

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("loads unique member bills and groups them as all, sponsored, and cosponsored", async () => {
    const billDataByPath: Record<string, Record<string, unknown>> = {
      "generalCourts/194/bills/sponsored-1": makeBillData("Sponsored bill"),
      "generalCourts/194/bills/cosponsored-1": makeBillData("Cosponsored bill"),
      "generalCourts/194/bills/shared-1": makeBillData("Shared bill")
    }

    ;(getDoc as jest.Mock).mockImplementation(
      async (reference: { path: string }) => {
        if (reference.path === "generalCourts/194/members/ABC123") {
          return makeSnapshot("ABC123", {
            content: {
              SponsoredBills: ["sponsored-1", "shared-1"],
              CoSponsoredBills: ["cosponsored-1", "shared-1"]
            }
          })
        }

        const data = billDataByPath[reference.path]
        return data
          ? makeSnapshot(
              reference.path.split("/")[reference.path.split("/").length - 1],
              data
            )
          : { exists: () => false }
      }
    )

    render(<BillsTab member={member} />)

    await waitFor(() => {
      expect(screen.getByTestId("bill-groups").textContent).toBe(
        JSON.stringify({
          all: ["sponsored-1", "shared-1", "cosponsored-1"],
          sponsored: ["sponsored-1", "shared-1"],
          cosponsored: ["shared-1", "cosponsored-1"]
        })
      )
    })

    expect(getFirestore).toHaveBeenCalledTimes(1)
    expect(doc).toHaveBeenCalledWith(
      { type: "db" },
      "generalCourts/194/members/ABC123"
    )
    expect(
      (getDoc as jest.Mock).mock.calls.filter(([reference]) =>
        reference.path.includes("/bills/")
      )
    ).toHaveLength(3)
  })

  it("renders empty bill groups when the member document does not exist", async () => {
    ;(getDoc as jest.Mock).mockResolvedValue({ exists: () => false })

    render(<BillsTab member={member} />)

    await waitFor(() => {
      expect(screen.getByTestId("bill-groups").textContent).toBe(
        JSON.stringify({ all: [], sponsored: [], cosponsored: [] })
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
