import {
  formatPrompt,
  SUMMARIZATION_PROMPT_LARGE,
  SUMMARIZATION_PROMPT_SMALL,
  TAGGING_PROMPT_USING_SUMMARIES
} from "./prompts"
import { splitTextByCharacters } from "./textSplitter"
import { BillDetails, LlmCallType } from "./types"

const CHUNK_SIZE = 90000
const CHUNK_OVERLAP = 1000

const wrap = (text: string) => `\`\`\`${text}\`\`\``

/** Splits text into overlapping chunks, each fenced in triple backticks. */
const toContext = (text: string): string =>
  splitTextByCharacters(text, CHUNK_SIZE, CHUNK_OVERLAP, "\n\n")
    .map(wrap)
    .join("\n\n")

/**
 * The values filling the "small" summarization prompt. Bill text and MGL text
 * are split into fenced chunks and joined with blank lines.
 */
export const prepareInvokeDict = (billDetails: BillDetails) => ({
  title: billDetails.billTitle,
  context: toContext(billDetails.billText),
  names: billDetails.mglNames,
  mgl_sections: toContext(billDetails.mglRef),
  committee_info: billDetails.committeeInfo
})

/**
 * The complete prompt for summarizing a bill. A "large" bill omits the MGL
 * text, which is supplied separately by retrieval (see `callLlm`).
 */
export const getQueryForSummarization = (
  billDetails: BillDetails,
  llmCallType: LlmCallType
): string =>
  llmCallType === "large"
    ? formatPrompt(SUMMARIZATION_PROMPT_LARGE, {
        bill_title: billDetails.billTitle,
        bill_text: billDetails.billText,
        mgl_names: billDetails.mglNames,
        committee_info: billDetails.committeeInfo
      })
    : formatPrompt(SUMMARIZATION_PROMPT_SMALL, prepareInvokeDict(billDetails))

/**
 * Renders tags as a quoted, bracketed list (`["a", "b"]`). Quoting keeps the
 * boundaries clear for topics that contain commas, such as "Social work,
 * volunteer service, charitable organizations".
 */
export const formatTagList = (tags: string[]): string =>
  `[${tags.map(tag => JSON.stringify(tag)).join(", ")}]`

/**
 * The complete prompt for choosing tags for a bill from its summary, from the
 * given list of allowed tags.
 */
export const getQueryForTagging = (
  billDetails: BillDetails,
  tags: string[]
): string =>
  formatPrompt(TAGGING_PROMPT_USING_SUMMARIES, {
    bill_title: billDetails.billTitle,
    context: wrap(billDetails.summary),
    tags: formatTagList(tags)
  })

/**
 * Splits the model's `#`-separated answer into trimmed, non-empty names.
 *
 * @example
 * extractCategoriesTags("Category1 # Category2 #Tag1# Tag2 ")
 * // ["Category1", "Category2", "Tag1", "Tag2"]
 */
export const extractCategoriesTags = (response: string): string[] =>
  response
    .split("#")
    .map(item => item.trim())
    .filter(item => item !== "")
