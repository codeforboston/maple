jest.mock("firebase-functions", () => ({
  logger: { info: jest.fn(), warn: jest.fn() },
  https: {}
}))
jest.mock("../malegislature", () => ({
  getDocument: jest.fn(),
  getDocumentPdf: jest.fn(),
  getBillHistory: jest.fn(),
  getSimilarBills: jest.fn()
}))
jest.mock("./pdfText", () => ({
  extractBillTextFromPdf: jest.fn()
}))
// Avoid evaluating the real scraper (and Firebase init) when importing ./bills.
jest.mock("../scraper", () => ({
  createScraper: jest.fn(() => ({ fetchBatch: {}, startBatches: {} }))
}))
jest.mock("../firebase", () => ({
  Timestamp: { fromMillis: jest.fn(() => "TS0") },
  FieldValue: { delete: jest.fn(() => "__DELETE__") }
}))
jest.mock("./contentBlocks", () => ({
  planDocumentTextStorage: jest.fn(),
  writeDocumentTextBlocks: jest.fn(),
  clearDocumentTextBlocks: jest.fn()
}))

import { FieldValue } from "../firebase"
import { fetchBillResource } from "./bills"
import {
  clearDocumentTextBlocks,
  planDocumentTextStorage,
  writeDocumentTextBlocks
} from "./contentBlocks"
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

describe("fetchBillResource document text storage", () => {
  const mockedApi = jest.requireMock("../malegislature") as {
    getDocument: jest.Mock
    getBillHistory: jest.Mock
    getSimilarBills: jest.Mock
  }
  const mockedPlan = planDocumentTextStorage as jest.MockedFunction<
    typeof planDocumentTextStorage
  >
  const mockedWrite = writeDocumentTextBlocks as jest.MockedFunction<
    typeof writeDocumentTextBlocks
  >
  const mockedClear = clearDocumentTextBlocks as jest.MockedFunction<
    typeof clearDocumentTextBlocks
  >

  beforeEach(() => {
    jest.resetAllMocks()
    mockedApi.getBillHistory.mockResolvedValue([])
    mockedApi.getSimilarBills.mockResolvedValue([])
    mockedApi.getDocument.mockResolvedValue({
      DocumentText: "bill text",
      Cosponsors: []
    })
    ;(FieldValue.delete as jest.Mock).mockReturnValue("__DELETE__")
    mockedWrite.mockResolvedValue(undefined)
    mockedClear.mockResolvedValue(undefined)
  })

  it("keeps text inline when it fits", async () => {
    mockedPlan.mockReturnValue({ inline: "bill text" })

    const { content } = (await fetchBillResource(194, "H1")) as any

    expect(mockedWrite).not.toHaveBeenCalled()
    expect(mockedClear).not.toHaveBeenCalled()
    expect(content.DocumentText).toBe("bill text")
    expect(content).not.toHaveProperty("DocumentTextBlockCount")
  })

  it("chunks oversized text into blocks and drops the inline copy", async () => {
    mockedPlan.mockReturnValue({ blocks: ["a", "b"] })

    const { content } = (await fetchBillResource(194, "H5500")) as any

    expect(mockedWrite).toHaveBeenCalledWith(194, "H5500", ["a", "b"])
    expect(content.DocumentTextBlockCount).toBe(2)
    expect(content.DocumentText).toBe("__DELETE__")
  })

  it("drops text without a count when block writing fails", async () => {
    mockedPlan.mockReturnValue({ blocks: ["a"] })
    mockedWrite.mockRejectedValue(new Error("write failed"))

    const { content } = (await fetchBillResource(194, "H5500", {
      content: { DocumentTextBlockCount: 3 }
    })) as any

    expect(mockedClear).toHaveBeenCalledWith(194, "H5500")
    expect(content.DocumentText).toBe("__DELETE__")
    expect(content.DocumentTextBlockCount).toBe("__DELETE__")
  })

  it("clears stale blocks when a previously chunked bill now fits inline", async () => {
    mockedPlan.mockReturnValue({ inline: "small" })
    mockedApi.getDocument.mockResolvedValue({
      DocumentText: "small",
      Cosponsors: []
    })

    const { content } = (await fetchBillResource(194, "H5500", {
      content: { DocumentTextBlockCount: 2 }
    })) as any

    expect(mockedClear).toHaveBeenCalledWith(194, "H5500")
    expect(content.DocumentText).toBe("small")
    expect(content.DocumentTextBlockCount).toBe("__DELETE__")
  })
})
