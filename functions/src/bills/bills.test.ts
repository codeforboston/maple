jest.mock("../malegislature", () => ({
  getDocument: jest.fn(),
  getDocumentPdf: jest.fn()
}))
jest.mock("./pdfText", () => ({
  extractBillTextFromPdf: jest.fn()
}))

import { getDocumentWithPdfTextFallback } from "./documentTextFallback"
import { extractBillTextFromPdf } from "./pdfText"

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
