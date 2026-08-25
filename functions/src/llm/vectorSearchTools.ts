/**
 * LangChain tool wrappers for the ReAct agent's vector search capabilities.
 *
 * Core Firestore search logic lives in policySearch.ts (single source of
 * truth for bills + ballot questions). Each tool here is a thin wrapper that
 * calls the shared helper and returns a formatted string to the LLM.
 *
 * The MCP server (mcp-server/tools.ts) exposes identically-named tools
 * (search_bills, search_ballot_questions, search_policies) backed by the
 * same Firestore collections — keep descriptions and result shapes in sync
 * when changing either file.
 *
 * Adding a new source type (e.g. hearing transcripts): add a helper to
 * policySearch.ts and register one more tool() here.
 */

import { DynamicStructuredTool } from "@langchain/core/tools"
import { z } from "zod"
import {
  searchBills,
  searchBallotQuestions,
  searchPolicies,
  searchBillTestimony,
  searchBallotQuestionTestimony,
  searchTestimony
} from "./policySearch"

// ---------------------------------------------------------------------------
// search_bills — legislative bills only
// ---------------------------------------------------------------------------

const billsSchema = z.object({
  query: z
    .string()
    .describe("A natural-language description of the bill topic to search for")
})

export const searchBillsTool = new DynamicStructuredTool({
  name: "search_bills",
  description:
    "Semantic search over Massachusetts legislative bills (title and full text). " +
    "Use this when the question is specifically about legislation or a bill number. " +
    "For questions that may involve both bills and ballot questions, prefer search_policies.",
  schema: billsSchema,
  func: async (input: unknown) => {
    const { query } = input as z.infer<typeof billsSchema>
    return searchBills(query)
  }
})

// ---------------------------------------------------------------------------
// search_ballot_questions — ballot questions only
// ---------------------------------------------------------------------------

const ballotSchema = z.object({
  query: z
    .string()
    .describe(
      "A natural-language description of the ballot question topic to search for"
    )
})

export const searchBallotQuestionsTool = new DynamicStructuredTool({
  name: "search_ballot_questions",
  description:
    "Semantic search over statewide ballot questions (title, description, and summary). " +
    "Use this when the question is specifically about a ballot initiative or referendum. " +
    "For questions that may involve both bills and ballot questions, prefer search_policies.",
  schema: ballotSchema,
  func: async (input: unknown) => {
    const { query } = input as z.infer<typeof ballotSchema>
    return searchBallotQuestions(query)
  }
})

// ---------------------------------------------------------------------------
// search_policies — combined bills + ballot questions, sorted by relevance
// ---------------------------------------------------------------------------

const policiesSchema = z.object({
  query: z
    .string()
    .describe(
      "A natural-language description of the policy topic or issue to search for"
    )
})

export const searchPoliciesTool = new DynamicStructuredTool({
  name: "search_policies",
  description:
    "Unified semantic search across both Massachusetts legislative bills AND " +
    "ballot questions, ranked by relevance. Use this as the default starting point " +
    "for any policy or issue question when you are unsure whether the answer lies " +
    "in a bill, a ballot question, or both.",
  schema: policiesSchema,
  func: async (input: unknown) => {
    const { query } = input as z.infer<typeof policiesSchema>
    return searchPolicies(query)
  }
})

// ---------------------------------------------------------------------------
// search_bill_testimony — testimony on bills (optionally scoped to one bill)
// ---------------------------------------------------------------------------

const billTestimonySchema = z.object({
  query: z
    .string()
    .describe(
      "A natural-language description of the testimony content to search for"
    ),
  billId: z
    .string()
    .optional()
    .describe(
      "Optional bill ID (e.g. 'H1234') to restrict results to testimony on that specific bill"
    )
})

export const searchBillTestimonyTool = new DynamicStructuredTool({
  name: "search_bill_testimony",
  description:
    "Semantic search over testimony submitted on Massachusetts legislative bills. " +
    "Optionally scope to a specific bill by providing its ID. Use this when the " +
    "question is specifically about what people have said about a bill or legislation. " +
    "For questions spanning both bills and ballot questions, prefer search_testimony.",
  schema: billTestimonySchema,
  func: async (input: unknown) => {
    const { query, billId } = input as z.infer<typeof billTestimonySchema>
    return searchBillTestimony(query, billId)
  }
})

// ---------------------------------------------------------------------------
// search_ballot_question_testimony — testimony on ballot questions
// ---------------------------------------------------------------------------

const ballotQuestionTestimonySchema = z.object({
  query: z
    .string()
    .describe(
      "A natural-language description of the testimony content to search for"
    ),
  ballotQuestionId: z
    .string()
    .optional()
    .describe(
      "Optional ballot question ID to restrict results to testimony on that specific question"
    )
})

export const searchBallotQuestionTestimonyTool = new DynamicStructuredTool({
  name: "search_ballot_question_testimony",
  description:
    "Semantic search over testimony submitted on Massachusetts ballot questions. " +
    "Optionally scope to a specific ballot question by providing its ID. Use this " +
    "when the question is specifically about what people have said about a ballot " +
    "initiative or referendum. For questions spanning both bills and ballot questions, " +
    "prefer search_testimony.",
  schema: ballotQuestionTestimonySchema,
  func: async (input: unknown) => {
    const { query, ballotQuestionId } = input as z.infer<
      typeof ballotQuestionTestimonySchema
    >
    return searchBallotQuestionTestimony(query, ballotQuestionId)
  }
})

// ---------------------------------------------------------------------------
// search_testimony — combined testimony across bills + ballot questions
// ---------------------------------------------------------------------------

const testimonySchema = z.object({
  query: z
    .string()
    .describe(
      "A natural-language description of the testimony content to search for"
    )
})

export const searchTestimonyTool = new DynamicStructuredTool({
  name: "search_testimony",
  description:
    "Unified semantic search across all public testimony — covering both " +
    "bills and ballot questions — ranked by relevance. Use this as the default " +
    "when you are unsure whether the testimony relates to a bill or a ballot question, " +
    "or when the question spans both types.",
  schema: testimonySchema,
  func: async (input: unknown) => {
    const { query } = input as z.infer<typeof testimonySchema>
    return searchTestimony(query)
  }
})

// ---------------------------------------------------------------------------
// Tool list registered with the ReAct agent (agent.ts)
// ---------------------------------------------------------------------------

export const vectorSearchTools = [
  // Policy (bills + ballot questions)
  searchPoliciesTool,          // combined — default for policy questions
  searchBillsTool,             // bill-only
  searchBallotQuestionsTool,   // ballot-only

  // Testimony
  searchTestimonyTool,              // combined — default for testimony questions
  searchBillTestimonyTool,          // testimony on bills only
  searchBallotQuestionTestimonyTool // testimony on ballot questions only
]
