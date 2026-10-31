import {
  getSummaryApiFunction,
  getTopicsForSummary
} from "functions/src/bills/llm/api"

/**
 * Backfills missing bill summaries and topics. The document must have
 * `content.Title` and `content.DocumentText` to generate a summary. Topics can
 * be generated from an existing summary or a newly generated one.
 *
 * The CSV header is `bill_id,status,summary,topics`. The statuses are:
 *
 * - `skipped` - the bill has no title or text
 * - `previous_summary` - the bill already had a summary
 * - `failed_summary` - the summary could not be generated, skip the bill
 * - `previous_topics` - the bill already had topics, skip it
 * - `failed_topics` - the topics could not be generated, skip the bill
 * - `generated_summary_and_topics` - the topics were generated successfully
 */
export const CSV_HEADER = ["bill_id", "status", "summary", "topics"]

/** The parts of a Firestore bill document the backfill reads and updates. */
export type BackfillBillDoc = {
  id: string
  data(): Record<string, any> | undefined
  ref: { update(data: Record<string, unknown>): Promise<unknown> }
}

export type BackfillDb = {
  collection(path: string): {
    get(): Promise<{ docs: BackfillBillDoc[] }>
  }
}

export type BackfillOptions = {
  court?: number
  billIds?: Set<string> | null
  dryRun?: boolean
}

const makeRow = (
  billId: string,
  status: string,
  summary: string | null,
  topics: unknown | null
): string[] => [
  billId,
  status,
  summary ?? "None",
  topics === null ? "None" : JSON.stringify(topics)
]

/** Splits a comma and/or whitespace separated list of bill ids. */
export const parseBillIds = (raw: string | null | undefined) => {
  if (raw == null) return null
  const ids = new Set(raw.split(/[\s,]+/).filter(id => id !== ""))
  return ids.size > 0 ? ids : null
}

export const backfillSummaries = async (
  db: BackfillDb,
  { court = 194, billIds = null, dryRun = false }: BackfillOptions = {}
): Promise<string[][]> => {
  const rows = [CSV_HEADER]
  const { docs } = await db.collection(`generalCourts/${court}/bills`).get()

  for (const doc of docs) {
    const bill = doc.data() ?? {}
    const billId: string = bill.id ?? doc.id
    if (billIds && !billIds.has(billId)) continue

    const text: string | undefined = bill.content?.DocumentText
    const title: string | undefined = bill.content?.Title
    let summary: string | undefined = bill.summary ?? undefined

    if (text == null || title == null) {
      rows.push(makeRow(billId, "skipped", null, null))
      continue
    }

    if (summary == null) {
      const result = await getSummaryApiFunction(billId, title, text)
      if (result.status !== 1) {
        rows.push(makeRow(billId, "failed_summary", null, null))
        continue
      }
      summary = result.summary
      if (!dryRun) await doc.ref.update({ summary })
    } else {
      rows.push(makeRow(billId, "previous_summary", null, null))
    }

    if (bill.topics != null) {
      rows.push(makeRow(billId, "previous_topics", null, null))
      continue
    }

    const { status, topics } = await getTopicsForSummary(billId, title, summary)
    if (status !== 1) {
      rows.push(makeRow(billId, "failed_topics", summary, null))
      continue
    }
    if (!dryRun) await doc.ref.update({ topics })
    rows.push(makeRow(billId, "generated_summary_and_topics", summary, topics))
  }

  return rows
}

const csvCell = (value: string) =>
  /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value

export const rowsToCsv = (rows: string[][]): string =>
  rows.map(row => row.map(csvCell).join(",")).join("\r\n") + "\r\n"
