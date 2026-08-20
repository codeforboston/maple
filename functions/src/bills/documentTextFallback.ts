import * as api from "../malegislature"
import { extractBillTextFromPdf, PdfTextExtractionResult } from "./pdfText"

export type DocumentTextFallbackResult = {
  content: any
  documentTextSource?: "api" | "pdf"
  pdfTextExtraction?: PdfTextExtractionResult | PdfFetchFailure
}

type PdfFetchFailure = {
  status: "fetch-error"
  charCount: 0
  pageCount?: undefined
  error: string
}

export async function getDocumentWithPdfTextFallback(
  court: number,
  id: string
): Promise<DocumentTextFallbackResult> {
  const content = await api.getDocument({ id, court })

  if (content.DocumentText != null) {
    return {
      content,
      documentTextSource: "api"
    }
  }

  delete content.DocumentText

  let pdf: Buffer
  try {
    pdf = await api.getDocumentPdf({ id, court })
  } catch (e) {
    return {
      content,
      pdfTextExtraction: {
        status: "fetch-error",
        charCount: 0,
        error: e instanceof Error ? e.message : String(e)
      }
    }
  }

  const pdfTextExtraction = await extractBillTextFromPdf(pdf)
  if (pdfTextExtraction.status === "extracted") {
    content.DocumentText = pdfTextExtraction.text
    return {
      content,
      documentTextSource: "pdf",
      pdfTextExtraction
    }
  }

  return {
    content,
    pdfTextExtraction
  }
}
