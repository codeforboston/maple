import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { doc, getDoc, getFirestore } from "firebase/firestore"
import { MemberContent } from "functions/src/members/types"
import { CommitteePositions } from "./CommitteePositions"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

jest.mock("firebase/firestore", () => ({
  doc: jest.fn((_db, path) => ({ path })),
  getDoc: jest.fn(),
  getFirestore: jest.fn(() => ({ type: "db" }))
}))

const makeSnapshot = (data: Record<string, unknown>) => ({
  exists: () => true,
  data: () => data
})

describe("CommitteePositions", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("shows the start date of the member's continuous committee history", async () => {
    const member = {
      GeneralCourtNumber: 194,
      MemberCode: "ABC123",
      Committees: [{ CommitteeCode: "J12", GeneralCourtNumber: 194 }]
    } as MemberContent

    ;(getDoc as jest.Mock).mockImplementation(
      async (reference: { path: string }) => {
        switch (reference.path) {
          case "generalCourts/194/committees/J12":
            return makeSnapshot({
              content: {
                ShortName: "Joint Committee on Example",
                HouseChairperson: null,
                SenateChairperson: null
              }
            })
          case "generalCourts/193/members/ABC123":
            return makeSnapshot({
              content: { Committees: [{ CommitteeCode: "J12" }] }
            })
          case "generalCourts/192/members/ABC123":
            return makeSnapshot({
              content: { Committees: [{ CommitteeCode: "OTHER" }] }
            })
          case "generalCourts/193":
            return makeSnapshot({ years: "2023" })
          default:
            return { exists: () => false }
        }
      }
    )

    render(<CommitteePositions member={member} />)

    await waitFor(() => {
      expect(screen.getByText("2023")).toBeTruthy()
    })

    expect(screen.getByText("Joint Committee on Example")).toBeTruthy()
    expect(screen.getByText("Member")).toBeTruthy()
    expect(getFirestore).toHaveBeenCalledTimes(1)
    expect(doc).toHaveBeenCalledWith(
      { type: "db" },
      "generalCourts/193/members/ABC123"
    )
    expect(doc).toHaveBeenCalledWith(
      { type: "db" },
      "generalCourts/192/members/ABC123"
    )
    expect(doc).toHaveBeenCalledWith({ type: "db" }, "generalCourts/193")
  })
})
