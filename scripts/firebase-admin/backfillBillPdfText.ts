import fs from "fs"
import { z } from "zod"
import { getDocumentWithPdfTextFallback } from "../../functions/src/bills/documentTextFallback"
import { Timestamp } from "../../functions/src/firebase"
import { Script } from "./types"

type BackfillStatus =
  | "skipped_has_document_text"
  | "updated_api_text"
  | "updated_pdf_text"
  | "pdf_no_text"
  | "pdf_too_short"
  | "pdf_fetch_failed"
  | "pdf_parse_failed"
  | "dry_run_would_update"

type BackfillRow = {
  bill_id: string
  status: BackfillStatus
  source: "api" | "pdf" | ""
  page_count: number | ""
  char_count: number | ""
  error: string
}

const Args = z.object({
  court: z.coerce.number(),
  bills: z.string().optional(),
  commit: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform(value => value === true || value === "true"),
  output: z.string().optional()
})

export const script: Script = async ({ db, args }) => {
  const { court, bills, commit = false, output } = Args.parse(args),
    allowlist = parseBillIds(bills),
    snapshot = await db.collection(`/generalCourts/${court}/bills`).get(),
    rows: BackfillRow[] = []

  let processed = 0

  for (const bill of snapshot.docs) {
    const id = bill.id,
      data = bill.data()

    if (allowlist && !allowlist.has(id)) {
      continue
    }

    if (data.content?.DocumentText != null) {
      rows.push({
        bill_id: id,
        status: "skipped_has_document_text",
        source: "",
        page_count: "",
        char_count: "",
        error: ""
      })
      continue
    }

    processed++

    const result = await getDocumentWithPdfTextFallback(court, id),
      documentText = result.content.DocumentText

    if (documentText != null) {
      if (commit) {
        await bill.ref.update({
          "content.DocumentText": documentText,
          fetchedAt: Timestamp.now()
        })
      }

      rows.push({
        bill_id: id,
        status: commit
          ? result.documentTextSource === "api"
            ? "updated_api_text"
            : "updated_pdf_text"
          : "dry_run_would_update",
        source: result.documentTextSource ?? "",
        page_count: result.pdfTextExtraction?.pageCount ?? "",
        char_count:
          result.pdfTextExtraction?.charCount ??
          documentText.replace(/\s/g, "").length,
        error: ""
      })
      continue
    }

    const extraction = result.pdfTextExtraction
    rows.push({
      bill_id: id,
      status: mapFailureStatus(extraction?.status),
      source: "pdf",
      page_count: extraction?.pageCount ?? "",
      char_count: extraction?.charCount ?? "",
      error: extraction?.error ?? ""
    })
  }

  const csv = toCsv(rows)
  if (output) {
    fs.writeFileSync(output, csv)
    console.log(`Wrote ${rows.length} rows to ${output}`)
  } else {
    console.log(csv)
  }

  console.log(
    `${commit ? "Updated" : "Dry run checked"} ${processed} missing-text bills`
  )
}

function parseBillIds(bills?: string) {
  if (!bills) return undefined

  return new Set(
    bills
      .split(/[,\s]+/)
      .map(id => id.trim())
      .filter(Boolean)
  )
}

function mapFailureStatus(status?: string): BackfillStatus {
  switch (status) {
    case "no-text":
      return "pdf_no_text"
    case "too-short":
      return "pdf_too_short"
    case "parse-error":
      return "pdf_parse_failed"
    case "fetch-error":
    default:
      return "pdf_fetch_failed"
  }
}

function toCsv(rows: BackfillRow[]) {
  return [
    ["bill_id", "status", "source", "page_count", "char_count", "error"],
    ...rows.map(row => [
      row.bill_id,
      row.status,
      row.source,
      row.page_count,
      row.char_count,
      row.error
    ])
  ]
    .map(row => row.map(formatCsvCell).join(","))
    .join("\n")
}

function formatCsvCell(value: string | number) {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}
