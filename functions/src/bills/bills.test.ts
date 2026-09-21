jest.mock("../malegislature", () => ({
  getDocument: jest.fn(),
  getDocumentPdf: jest.fn()
}))
jest.mock("./pdfText", () => ({
  extractBillTextFromPdf: jest.fn()
}))

import { getDocumentWithPdfTextFallback } from "./documentTextFallback"
import { extractBillTextFromPdf } from "./pdfText"
import { isInConferenceCommittee } from "./bills"
import { BillHistory } from "./types"

const mockedApi = jest.requireMock("../malegislature") as {
  getDocument: jest.Mock
  getDocumentPdf: jest.Mock
}
const mockedExtractBillTextFromPdf =
  extractBillTextFromPdf as jest.MockedFunction<typeof extractBillTextFromPdf>

describe("getDocumentWithPdfTextFallback", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("does not fetch a PDF when API text is present", async () => {
    mockedApi.getDocument.mockResolvedValue({ DocumentText: "API text" })

    await expect(
      getDocumentWithPdfTextFallback(194, "H1")
    ).resolves.toMatchObject({
      content: { DocumentText: "API text" },
      documentTextSource: "api"
    })
    expect(mockedApi.getDocumentPdf).not.toHaveBeenCalled()
  })

  it("sets DocumentText when PDF extraction succeeds", async () => {
    mockedApi.getDocument.mockResolvedValue({ DocumentText: null })
    mockedApi.getDocumentPdf.mockResolvedValue(Buffer.from("pdf"))
    mockedExtractBillTextFromPdf.mockResolvedValue({
      status: "extracted",
      text: "PDF text",
      pageCount: 1,
      charCount: 7
    })

    await expect(
      getDocumentWithPdfTextFallback(194, "H1")
    ).resolves.toMatchObject({
      content: { DocumentText: "PDF text" },
      documentTextSource: "pdf",
      pdfTextExtraction: { status: "extracted" }
    })
  })

  it("leaves DocumentText absent when PDF has no text", async () => {
    mockedApi.getDocument.mockResolvedValue({ DocumentText: null })
    mockedApi.getDocumentPdf.mockResolvedValue(Buffer.from("pdf"))
    mockedExtractBillTextFromPdf.mockResolvedValue({
      status: "no-text",
      pageCount: 1,
      charCount: 0
    })

    const result = await getDocumentWithPdfTextFallback(194, "H18")

    expect(result.content).not.toHaveProperty("DocumentText")
    expect(result.pdfTextExtraction).toMatchObject({ status: "no-text" })
  })

  it("leaves DocumentText absent when PDF fetch fails", async () => {
    mockedApi.getDocument.mockResolvedValue({ DocumentText: null })
    mockedApi.getDocumentPdf.mockRejectedValue(new Error("not found"))

    const result = await getDocumentWithPdfTextFallback(194, "H18")

    expect(result.content).not.toHaveProperty("DocumentText")
    expect(result.pdfTextExtraction).toMatchObject({
      status: "fetch-error",
      error: "not found"
    })
  })
})

describe("isInConferenceCommittee", () => {
  const action = (Action: string): BillHistory[number] => ({
    Date: "1/1/2024",
    Branch: "House",
    Action
  })

  it("is true when the last action mentions committee of conference appointed", () => {
    const history: BillHistory = [
      action("Referred to the committee on Ways and Means"),
      action("Committee of conference appointed")
    ]

    expect(isInConferenceCommittee(history)).toBe(true)
  })

  it("is false when the last action does not mention it", () => {
    const history: BillHistory = [
      action("Committee of conference appointed"),
      action("Bill passed to be enacted")
    ]

    expect(isInConferenceCommittee(history)).toBe(false)
  })

  it("is false for empty history", () => {
    expect(isInConferenceCommittee([])).toBe(false)
  })
})
