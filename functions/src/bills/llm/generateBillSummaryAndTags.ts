import { logger } from "firebase-functions"
import { onDocumentCreated } from "firebase-functions/v2/firestore"

/** The part of a Firestore snapshot the trigger needs. */
export type BillSnapshot = {
  data(): Record<string, any> | undefined
  ref: { update(data: Record<string, unknown>): Promise<unknown> }
}

/**
 * The LLM code (OpenAI client, tokenizer, MGL names table) is large, and every
 * function in this codebase shares one entry point. Loading it on first use
 * keeps it out of the cold start and memory of all the other functions.
 */
const loadLlmApi = () => import("./api")

/**
 * Fills in a new bill's summary and topics. Existing values are kept, so the
 * trigger can safely be re-run: a bill with a summary only gets topics, and a
 * bill with topics is left alone.
 */
export const processNewBill = async (
  billId: string,
  snapshot: BillSnapshot | undefined
): Promise<void> => {
  if (!snapshot) {
    logger.info(`bill with id \`${billId}\` has no event data`)
    return
  }
  const bill = snapshot.data()
  if (!bill) {
    logger.info(`bill with id \`${billId}\` has no inserted content`)
    return
  }

  const title: string | undefined = bill.content?.Title
  const text: string | undefined = bill.content?.DocumentText
  let summary: string | undefined = bill.summary ?? undefined

  if (summary == null) {
    if (text == null || title == null) {
      logger.info(
        `bill with id \`${billId}\` unable to fetch document text or title`
      )
      return
    }

    const { getSummaryApiFunction } = await loadLlmApi()
    const result = await getSummaryApiFunction(billId, title, text)
    if (result.status !== 1) {
      logger.info(
        `failed to generate summary for bill with id \`${billId}\`, got ${result.status}`
      )
      return
    }

    summary = result.summary
    await snapshot.ref.update({ summary })
    logger.info(`Successfully updated summary for bill with id \`${billId}\``)
  }

  if (bill.topics != null) {
    logger.info(`bill with id \`${billId}\` has topics`)
    return
  }

  const { getTopicsForSummary } = await loadLlmApi()
  const { status, topics } = await getTopicsForSummary(
    billId,
    title ?? "",
    summary
  )
  if (status !== 1) {
    logger.info(
      `failed to generate tags for bill with id \`${billId}\`, got ${status}`
    )
    return
  }
  await snapshot.ref.update({ topics })
  logger.info(`Successfully updated topics for bill with id \`${billId}\``)
}

/**
 * Runs once when a bill document is created. `OPENAI_API_KEY` is a secret, so
 * the OpenAI client reads it from the environment; each deployment (and local
 * run) provides its own value.
 */
export const generateBillSummaryAndTags = onDocumentCreated(
  {
    document: "generalCourts/{session_id}/bills/{bill_id}",
    secrets: ["OPENAI_API_KEY"],
    timeoutSeconds: 300,
    memory: "1GiB"
  },
  async event => {
    await processNewBill(event.params.bill_id, event.data)
  }
)
