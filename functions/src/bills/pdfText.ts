const pdfParse =
  require("pdf-parse/lib/pdf-parse") as typeof import("pdf-parse")

export const MIN_EXTRACTED_TEXT_CHARS = 10

export type PdfTextExtractionStatus =
  | "extracted"
  | "no-text"
  | "too-short"
  | "parse-error"

export type PdfTextExtractionResult = {
  status: PdfTextExtractionStatus
  text?: string
  pageCount?: number
  charCount: number
  error?: string
}

export async function extractBillTextFromPdf(
  pdf: Buffer
): Promise<PdfTextExtractionResult> {
  try {
    const result = await pdfParse(pdf),
      text = normalizeExtractedBillText(result.text),
      charCount = text.replace(/\s/g, "").length,
      pageCount = result.numpages

    if (!text) {
      return { status: "no-text", pageCount, charCount }
    }

    if (charCount < MIN_EXTRACTED_TEXT_CHARS) {
      return { status: "too-short", text, pageCount, charCount }
    }

    return { status: "extracted", text, pageCount, charCount }
  } catch (e) {
    return {
      status: "parse-error",
      charCount: 0,
      error: e instanceof Error ? e.message : String(e)
    }
  }
}

export function normalizeExtractedBillText(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map(line => line.trim())
    .filter(line => !!line && !isPageCounter(line))
    .join("\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function isPageCounter(line: string) {
  return (
    /^\d+\s+(of|OF)\s+\d+$/.test(line) ||
    /^--\s*\d+\s+of\s+\d+\s*--$/.test(line)
  )
}
