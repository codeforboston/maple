import { isString } from "lodash"
import { logger } from "firebase-functions"
import { logFetchError } from "../common"
import { DocumentData, FieldValue } from "../firebase"
import * as api from "../malegislature"
import { createScraper } from "../scraper"
import {
  clearDocumentTextBlocks,
  planDocumentTextStorage,
  writeDocumentTextBlocks
} from "./contentBlocks"
import { getDocumentWithPdfTextFallback } from "./documentTextFallback"
import { Bill, MISSING_TIMESTAMP } from "./types"

export { getDocumentWithPdfTextFallback } from "./documentTextFallback"

/**
 * Fetch and assemble a bill's document for storage. Oversized bill text (past
 * Firestore's 1 MiB document limit, e.g. budget bills) is moved into the
 * `contentBlocks` subcollection and stripped from the inline document so the
 * rest of the bill still scrapes; the UI reassembles the blocks on demand.
 */
export async function fetchBillResource(
  court: number,
  id: string,
  current?: DocumentData
): Promise<Partial<Bill>> {
  const { content, pdfTextExtraction } = await getDocumentWithPdfTextFallback(
    court,
    id
  )
  const history = await api
    .getBillHistory(court, id)
    .catch(logFetchError("bill history", id))
    .then(history => history ?? [])
  // Most of our time is spent fetching similar bills
  const similar = await api
    .getSimilarBills(court, id)
    .catch(logFetchError("similar bills", id))
    .then(bills => bills?.map(b => b.BillNumber).filter(isString) ?? [])

  if (content.DocumentText == null && pdfTextExtraction) {
    logger.info(
      `No bill text extracted from PDF for ${court}/${id}: ${pdfTextExtraction.status}`
    )
  }

  await storeDocumentText(court, id, content, current)

  const resource: Partial<Bill> = {
    content,
    history,
    similar,
    cosponsorCount: content.Cosponsors.length,
    testimonyCount: current?.testimonyCount ?? 0,
    endorseCount: current?.endorseCount ?? 0,
    neutralCount: current?.neutralCount ?? 0,
    opposeCount: current?.opposeCount ?? 0,
    latestTestimonyAt: current?.latestTestimonyAt ?? MISSING_TIMESTAMP,
    nextHearingAt: current?.nextHearingAt ?? MISSING_TIMESTAMP
  }

  return resource
}

/**
 * Mutates `content` in place to reflect how the bill's text is stored: inline
 * for normal bills, or chunked into the `contentBlocks` subcollection when it
 * would overflow the document. Inline copies / stale counts are removed with a
 * delete sentinel because the main document is written with `{ merge: true }`.
 */
async function storeDocumentText(
  court: number,
  id: string,
  content: any,
  current?: DocumentData
): Promise<void> {
  const plan = planDocumentTextStorage(content.DocumentText ?? undefined),
    hadBlocks = !!current?.content?.DocumentTextBlockCount

  if (plan.blocks) {
    try {
      await writeDocumentTextBlocks(court, id, plan.blocks)
      content.DocumentTextBlockCount = plan.blocks.length
    } catch (e) {
      logger.warn(
        `Failed to write content blocks for ${court}/${id}: ${
          e instanceof Error ? e.message : String(e)
        }`
      )
      // Fall back to the baseline behavior: drop the text entirely so the bill
      // still scrapes (the UI falls back to the PDF download link).
      if (hadBlocks) {
        await clearDocumentTextBlocks(court, id).catch(() => undefined)
        content.DocumentTextBlockCount = FieldValue.delete()
      }
    }
    // The inline copy must never be written to the size-limited main document.
    content.DocumentText = FieldValue.delete()
  } else if (hadBlocks) {
    // Text now fits inline (or is absent) but this bill previously stored
    // blocks — remove the stale chunks and clear the count.
    await clearDocumentTextBlocks(court, id)
    content.DocumentTextBlockCount = FieldValue.delete()
  }
}

/**
 * There are around 8000 documents. With 8 batches per day, 20 parallel
 * scrapers, and 50 documents per batch, we will process all documents once per
 * day.
 */
export const { fetchBatch: fetchBillBatch, startBatches: startBillBatches } =
  createScraper({
    resourceName: "bills",
    batchesPerRun: 20,
    resourcesPerBatch: 50,
    startBatchSchedule: "every 3 hours",
    fetchBatchTimeout: 240,
    startBatchTimeout: 240,
    fetchResource: fetchBillResource,
    listIds: (court: number) =>
      api.listDocuments({ court }).then(docs => docs.map(d => d.BillNumber))
  })
