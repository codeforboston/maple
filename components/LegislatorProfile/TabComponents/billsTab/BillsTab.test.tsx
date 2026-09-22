import React from "react"
import { render, waitFor } from "@testing-library/react"

import {
  collection,
  getDocs,
  getFirestore,
  query,
  where
} from "firebase/firestore"
import { BillsTabContainer } from "./BillsTab"

jest.mock("firebase/firestore", () => {
  const actual = jest.requireActual("firebase/firestore")

  return {
    ...actual,
    getFirestore: jest.fn(() => ({ type: "db" })),
    collection: jest.fn((db, path) => ({ db, path })),
    query: jest.fn((ref, ...clauses) => ({ ref, clauses })),
    where: jest.fn((field, op, value) => ({ field, op, value })),
    getDocs: jest.fn()
  }
})

describe("BillsTabContainer", () => {
  const member = {
    content: {
      GeneralCourtNumber: 194,
      MemberCode: "ABC123"
    }
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getDocs as jest.Mock).mockResolvedValue({
      docs: [
        {
          id: "bill-1",
          data: () => ({
            id: "bill-1",
            content: { PrimarySponsor: { Id: "ABC123" } }
          })
        }
      ]
    })
  })

  it("loads bills for the member's primary sponsorship", async () => {
    render(<BillsTabContainer member={member} />)

    await waitFor(() => {
      expect(getFirestore).toHaveBeenCalledTimes(1)
      expect(collection).toHaveBeenCalledWith(
        { type: "db" },
        "generalCourts/194/bills"
      )
      expect(where).toHaveBeenCalledWith(
        "content.PrimarySponsor.Id",
        "==",
        "ABC123"
      )
      expect(query).toHaveBeenCalledTimes(1)
      expect(getDocs).toHaveBeenCalledTimes(1)
    })
  })

  it("does not render anything when the bills query fails", async () => {
    ;(getDocs as jest.Mock).mockRejectedValue(new Error("Firestore failed"))

    const { container } = render(<BillsTabContainer member={member} />)

    await waitFor(() => {
      expect(getDocs).toHaveBeenCalledTimes(1)
    })

    expect(container.childElementCount).toBe(0)
    expect(container.innerHTML).toBe("")
  })
})
