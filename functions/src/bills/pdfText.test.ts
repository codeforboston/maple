const mockedPdfParse = jest.fn()

jest.mock("pdf-parse/lib/pdf-parse", () => mockedPdfParse)

import { extractBillTextFromPdf, normalizeExtractedBillText } from "./pdfText"

describe("normalizeExtractedBillText", () => {
  it("trims and collapses noisy whitespace", () => {
    expect(
      normalizeExtractedBillText(" \r\n  Section   1.   Text\t\t here.  \n\n\n")
    ).toBe("Section 1. Text here.")
  })

  it("removes standalone page counters", () => {
    expect(
      normalizeExtractedBillText("1 of 3\nHOUSE No. 1\n-- 2 of 3 --\nBill text")
    ).toBe("HOUSE No. 1\nBill text")
  })

  it("preserves substantive bill text", () => {
    const text =
      "The General Laws are hereby amended.\nSection 2. This act shall take effect."

    expect(normalizeExtractedBillText(text)).toBe(text)
  })
})

describe("extractBillTextFromPdf", () => {
  beforeEach(() => {
    mockedPdfParse.mockReset()
  })

  it("returns extracted when text is long enough", async () => {
    mockedPdfParse.mockResolvedValue({
      text: "An Act " + "with enough extracted text. ".repeat(10),
      numpages: 2,
      numrender: 2,
      info: {},
      metadata: {},
      version: "default"
    })

    const result = await extractBillTextFromPdf(Buffer.from("pdf"))

    expect(result.status).toBe("extracted")
    expect(result.pageCount).toBe(2)
    expect(result.text).toContain("An Act")
  })

  it("returns no-text for empty extraction", async () => {
    mockedPdfParse.mockResolvedValue({
      text: " \n\t ",
      numpages: 1,
      numrender: 1,
      info: {},
      metadata: {},
      version: "default"
    })

    await expect(
      extractBillTextFromPdf(Buffer.from("pdf"))
    ).resolves.toMatchObject({
      status: "no-text",
      charCount: 0,
      pageCount: 1
    })
  })

  it("returns too-short for tiny extraction", async () => {
    mockedPdfParse.mockResolvedValue({
      text: "short text",
      numpages: 1,
      numrender: 1,
      info: {},
      metadata: {},
      version: "default"
    })

    await expect(
      extractBillTextFromPdf(Buffer.from("pdf"))
    ).resolves.toMatchObject({
      status: "too-short",
      text: "short text",
      pageCount: 1
    })
  })

  it("returns parse-error when parser throws", async () => {
    mockedPdfParse.mockRejectedValue(new Error("bad pdf"))

    await expect(
      extractBillTextFromPdf(Buffer.from("pdf"))
    ).resolves.toMatchObject({
      status: "parse-error",
      error: "bad pdf"
    })
  })
})
