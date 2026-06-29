import "@testing-library/jest-dom"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { Summary } from "components/bill/Summary"
import { getBillDocumentText } from "components/db"
import type { Bill } from "components/db/bills"
import { Timestamp } from "firebase/firestore"

// jsdom lacks matchMedia, which Summary's useMediaQuery relies on.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

// Keep every real db export, but stub the block reassembly so the test does not
// touch Firestore.
jest.mock("components/db", () => ({
  __esModule: true,
  ...jest.requireActual("components/db"),
  getBillDocumentText: jest.fn()
}))

const mockedGetBillDocumentText = getBillDocumentText as jest.MockedFunction<
  typeof getBillDocumentText
>

const makeBill = (content: Partial<Bill["content"]>): Bill =>
  ({
    id: "H5500",
    court: 194,
    content: {
      Title: "An Act making appropriations",
      BillNumber: "H5500",
      DocketNumber: "HD1",
      GeneralCourtNumber: 194,
      Cosponsors: [],
      LegislationTypeName: "Bill",
      Pinslip: "",
      ...content
    },
    cosponsorCount: 0,
    testimonyCount: 0,
    endorseCount: 0,
    opposeCount: 0,
    neutralCount: 0,
    fetchedAt: new Timestamp(0, 0),
    history: []
  } as unknown as Bill)

describe("Summary bill text", () => {
  beforeEach(() => jest.clearAllMocks())

  it("reassembles chunked text from content blocks when the modal opens", async () => {
    mockedGetBillDocumentText.mockResolvedValue("Reassembled full bill text")
    const bill = makeBill({ DocumentTextBlockCount: 2 })

    render(<Summary bill={bill} />)

    fireEvent.click(screen.getByRole("button", { name: "bill.view_bill" }))

    await waitFor(() =>
      expect(screen.getByText("Reassembled full bill text")).toBeInTheDocument()
    )
    expect(mockedGetBillDocumentText).toHaveBeenCalledWith(
      194,
      "H5500",
      bill.content
    )
  })

  it("shows inline text without reading content blocks", () => {
    const bill = makeBill({ DocumentText: "Inline bill text" })

    render(<Summary bill={bill} />)

    fireEvent.click(screen.getByRole("button", { name: "bill.view_bill" }))

    expect(screen.getByText("Inline bill text")).toBeInTheDocument()
    expect(mockedGetBillDocumentText).not.toHaveBeenCalled()
  })

  it("falls back to a PDF download link when there is no text or blocks", () => {
    render(<Summary bill={makeBill({})} />)

    expect(
      screen.queryByRole("button", { name: "bill.view_bill" })
    ).not.toBeInTheDocument()
    expect(screen.getByText("bill.download_pdf")).toBeInTheDocument()
  })
})
