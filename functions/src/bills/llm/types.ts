/** Everything the summarizer and tagger need to know about a bill. */
export type BillDetails = {
  billId: string
  billTitle: string
  billText: string
  mglRef: string
  committeeInfo: string
  mglNames: string
  summary: string
}

export type LlmResults = {
  query: string
  response: string
}

/**
 * "small" sends the whole prompt to the model. "large" is for bills whose
 * referenced MGL text would overflow the context window, so that text is
 * retrieved by embedding similarity instead.
 */
export type LlmCallType = "small" | "large"

export const emptyBillDetails = (
  overrides: Partial<BillDetails> = {}
): BillDetails => ({
  billId: "",
  billTitle: "",
  billText: "",
  mglRef: "",
  committeeInfo: "",
  mglNames: "",
  summary: "",
  ...overrides
})
