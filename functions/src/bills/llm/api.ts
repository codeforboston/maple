import { CATEGORIES_BY_TOPIC, TOPICS_BY_CATEGORY } from "../types"
import { assignCategoriesToTopics } from "../topicParser"
import { callLlm } from "./callLlm"
import { extractBillContext } from "./mglSections"
import { normalizeSummary } from "./normalizeSummary"
import {
  extractCategoriesTags,
  getQueryForSummarization,
  getQueryForTagging
} from "./queries"
import { getLlmCallType } from "./tokens"
import { emptyBillDetails } from "./types"

/** Every topic the tagger may assign, taken from the shared bill taxonomy. */
export const ALLOWED_TAGS: string[] = Object.values(TOPICS_BY_CATEGORY).flatMap(
  topics => [...topics]
)

export type SummaryResult = {
  /** 1: success, -1: the bill title or text was missing. */
  status: 1 | -1
  summary: string
}

export type TagsResult = {
  /** 1: success, -2: the bill title or summary was missing. */
  status: 1 | -2
  tags: string[]
}

/** Summarizes a bill for a resident, using the MGL text the bill references. */
export const getSummaryApiFunction = async (
  billId: string,
  billTitle: string,
  billText: string
): Promise<SummaryResult> => {
  if (!billTitle || !billText) return { status: -1, summary: "" }

  const { combinedMgl, mglNames } = await extractBillContext(billText)
  const billDetails = emptyBillDetails({
    billId,
    billTitle,
    billText,
    mglRef: combinedMgl,
    committeeInfo: "None:None",
    mglNames
  })

  const callType = getLlmCallType(billDetails)
  const query = getQueryForSummarization(billDetails, callType)
  const { response } = await callLlm(billDetails, query, callType)
  return { status: 1, summary: normalizeSummary(response) }
}

/**
 * Picks topics for a bill from its summary. Anything the model returns that is
 * not in the taxonomy is dropped, and duplicates are removed.
 */
export const getTagsApiFunctionV2 = async (
  billId: string,
  billTitle: string,
  billSummary: string
): Promise<TagsResult> => {
  if (!billTitle || !billSummary) return { status: -2, tags: [] }

  const billDetails = emptyBillDetails({
    billId,
    billTitle,
    summary: billSummary
  })
  const query = getQueryForTagging(billDetails, ALLOWED_TAGS)
  const { response } = await callLlm(billDetails, query, "small")

  const tags = [...new Set(extractCategoriesTags(response))].filter(
    tag => tag in CATEGORIES_BY_TOPIC
  )
  return { status: 1, tags }
}

/** Tags a bill and attaches each topic's category, ready to store on the bill. */
export const getTopicsForSummary = async (
  billId: string,
  billTitle: string,
  billSummary: string
) => {
  const { status, tags } = await getTagsApiFunctionV2(
    billId,
    billTitle,
    billSummary
  )
  return { status, topics: assignCategoriesToTopics(tags) }
}
