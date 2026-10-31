import { getEncoding } from "js-tiktoken"
import { BillDetails, LlmCallType } from "./types"

export const GPT_MODEL_VERSION = "gpt-4o-mini"
export const MAX_TOKEN_LIMIT = 128000

/**
 * Number of tokens in the given bill pieces under `gpt-4o-mini`'s encoding.
 * Special-token text such as "<|endoftext|>" is counted as ordinary text
 * rather than rejected, since bill text is arbitrary input.
 */
export const countTokens = (
  billTitle: string,
  billText: string,
  mglRef: string,
  mglNames: string,
  committeeInfo: string
): number => {
  const text = billTitle + billText + mglRef + mglNames + committeeInfo
  return getEncoding("o200k_base").encode(text, [], []).length
}

/** "small" while the whole prompt fits in the context window with headroom. */
export const getLlmCallType = (billDetails: BillDetails): LlmCallType => {
  const numTokens = countTokens(
    billDetails.billTitle,
    billDetails.billText,
    billDetails.mglRef,
    billDetails.mglNames,
    billDetails.committeeInfo
  )
  return numTokens < MAX_TOKEN_LIMIT - 5000 ? "small" : "large"
}
