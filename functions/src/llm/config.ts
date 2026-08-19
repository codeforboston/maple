export const LLM_CONFIG = {
  // Reasoning/generation model (embeddings are handled separately by
  // Vertex AI text-embedding-005 - see embeddings.ts).
  openaiModel: "gpt-4o-mini",
  temperature: 0,
  maxOutputTokens: 800,

  // ReAct loop bound. LangGraph counts each node transition, so this allows
  // roughly (recursionLimit / 2) tool calls before forcing a final answer.
  recursionLimit: 10,

  // Number of documents to return per vector search tool call.
  vectorSearchTopK: 5,

  // Anonymous users: no persistent identity, so cost control is a small
  // fixed per-request ceiling only (see usage.ts for why this can't be
  // tracked across requests).
  anonymousMaxOutputTokens: 500,
  anonymousRecursionLimit: 6,

  // Logged-in users: persistent monthly token budget, tracked in the
  // top-level `llmUsage` collection (see usage.ts).
  loggedInMonthlyTokenBudget: 50_000
}
