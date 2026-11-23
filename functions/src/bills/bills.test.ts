jest.mock("../malegislature", () => ({
  getDocument: jest.fn(),
  getDocumentPdf: jest.fn()
}))
jest.mock("./pdfText", () => ({
  extractBillTextFromPdf: jest.fn()
}))
jest.mock("firebase-functions", () => ({
  logger: { warn: jest.fn(), info: jest.fn() }
}))
jest.mock("../scraper", () => ({
  createScraper: jest.fn(() => ({ fetchBatch: {}, startBatches: {} }))
}))
jest.mock("../firebase", () => ({
  Timestamp: { fromMillis: jest.fn(() => ({})), now: jest.fn(() => ({})) },
  FieldValue: { delete: jest.fn() },
  FieldPath: {}
}))
jest.mock("@google-cloud/firestore", () => ({
  FieldValue: { delete: jest.fn() }
}))

import { getDocumentWithPdfTextFallback } from "./documentTextFallback"
import { extractBillTextFromPdf } from "./pdfText"
import { dropDocumentTextIfTooLarge, MAX_FIRESTORE_DOC_BYTES } from "./bills"
import { logger } from "firebase-functions"

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

describe("dropDocumentTextIfTooLarge", () => {
  const mockedLogger = logger as jest.Mocked<typeof logger>

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("leaves DocumentText intact when resource is within the size limit", () => {
    const content = { DocumentText: "short text", Cosponsors: [] } as any
    const resource = { content } as any

    dropDocumentTextIfTooLarge(resource, 194, "H1")

    expect(content.DocumentText).toBe("short text")
    expect(mockedLogger.warn).not.toHaveBeenCalled()
  })

  it("drops DocumentText and warns when resource exceeds 1 MiB", () => {
    const longText = "x".repeat(MAX_FIRESTORE_DOC_BYTES + 100)
    const content = { DocumentText: longText, Cosponsors: [] } as any
    const resource = { content } as any

    dropDocumentTextIfTooLarge(resource, 194, "H5500")

    expect(content).not.toHaveProperty("DocumentText")
    expect(mockedLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining("H5500")
    )
    expect(mockedLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining("dropping DocumentText")
    )
  })

  it("mutates the same content object referenced by the resource", () => {
    const longText = "x".repeat(MAX_FIRESTORE_DOC_BYTES + 100)
    const content = { DocumentText: longText, Cosponsors: [] } as any
    const resource = { content } as any

    dropDocumentTextIfTooLarge(resource, 194, "H5500")

    expect(resource.content).not.toHaveProperty("DocumentText")
  })
})
