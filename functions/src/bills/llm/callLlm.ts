import { getEncoding } from "js-tiktoken"
import OpenAI from "openai"
import { formatPrompt, RAG_PROMPT_TEMPLATE } from "./prompts"
import { splitTextByTokens } from "./textSplitter"
import { countTokens, GPT_MODEL_VERSION, MAX_TOKEN_LIMIT } from "./tokens"
import { BillDetails, LlmCallType, LlmResults } from "./types"

const EMBEDDING_MODEL = "text-embedding-ada-002"
const EMBEDDING_MAX_TOKENS = 8191
const EMBEDDING_BATCH_SIZE = 64
const MGL_CHUNK_TOKENS = 2000
const MGL_CHUNK_OVERLAP_TOKENS = 200
const MAX_MGL_CHARACTERS = 1_000_000
const MAX_RETRIEVED_CHUNKS = 7

/** Created on demand so importing this module never needs an API key. */
const createClient = () => new OpenAI()

const chat = async (client: OpenAI, prompt: string): Promise<string> => {
  const completion = await client.chat.completions.create({
    model: GPT_MODEL_VERSION,
    temperature: 0,
    seed: 42,
    messages: [{ role: "user", content: prompt }]
  })
  return completion.choices[0]?.message?.content ?? ""
}

const embed = async (client: OpenAI, inputs: string[]): Promise<number[][]> => {
  const embeddings: number[][] = []
  for (let i = 0; i < inputs.length; i += EMBEDDING_BATCH_SIZE) {
    const { data } = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: inputs.slice(i, i + EMBEDDING_BATCH_SIZE)
    })
    embeddings.push(...data.map(d => d.embedding))
  }
  return embeddings
}

const normalize = (vector: number[]): number[] => {
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0))
  return norm === 0 ? vector : vector.map(v => v / norm)
}

/**
 * Embeds text that may exceed the embedding model's input limit by embedding
 * each window of at most 8191 tokens and taking their length-weighted average.
 */
const embedQuery = async (client: OpenAI, text: string): Promise<number[]> => {
  const encoding = getEncoding("cl100k_base")
  const ids = encoding.encode(text, [], [])
  const windows: { text: string; length: number }[] = []
  for (let i = 0; i < ids.length; i += EMBEDDING_MAX_TOKENS) {
    const window = ids.slice(i, i + EMBEDDING_MAX_TOKENS)
    windows.push({ text: encoding.decode(window), length: window.length })
  }
  if (windows.length === 0) windows.push({ text: "", length: 1 })

  const embeddings = await embed(
    client,
    windows.map(w => w.text)
  )
  const totalLength = windows.reduce((sum, w) => sum + w.length, 0)
  const average = embeddings[0].map((_, dimension) =>
    embeddings.reduce(
      (sum, e, i) => sum + (e[dimension] * windows[i].length) / totalLength,
      0
    )
  )
  return normalize(average)
}

const dot = (a: number[], b: number[]) =>
  a.reduce((sum, value, i) => sum + value * b[i], 0)

/** The MGL chunks most similar to `query`, most similar first. */
const retrieveMglChunks = async (
  client: OpenAI,
  mglRef: string,
  query: string,
  count: number
): Promise<string[]> => {
  if (count <= 0) return []
  const chunks = splitTextByTokens(
    mglRef.slice(0, MAX_MGL_CHARACTERS),
    MGL_CHUNK_TOKENS,
    MGL_CHUNK_OVERLAP_TOKENS
  )
  if (chunks.length === 0) return []

  const [chunkEmbeddings, queryEmbedding] = await Promise.all([
    embed(client, chunks),
    embedQuery(client, query)
  ])
  return chunkEmbeddings
    .map((embedding, index) => ({
      index,
      score: dot(normalize(embedding), queryEmbedding)
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, count)
    .map(({ index }) => chunks[index])
}

/**
 * For a bill too large to send whole: answers `query` using only the most
 * relevant pieces of the referenced MGL text, as many as the context window
 * leaves room for (at most 7 chunks of about 2,000 tokens).
 */
const largeDocs = async (
  client: OpenAI,
  billDetails: BillDetails,
  query: string
): Promise<string> => {
  const count = Math.min(
    Math.floor(
      (MAX_TOKEN_LIMIT - countTokens("", billDetails.billText, "", "", "")) /
        2000
    ) - 2,
    MAX_RETRIEVED_CHUNKS
  )
  const chunks = await retrieveMglChunks(
    client,
    billDetails.mglRef,
    query,
    count
  )
  return chat(
    client,
    formatPrompt(RAG_PROMPT_TEMPLATE, {
      context: chunks.join("\n\n"),
      question: query
    })
  )
}

/**
 * Sends a complete prompt to the model and returns its raw response.
 * `llmCallType` "large" retrieves the bill's MGL text by similarity rather than
 * including it in the prompt. `client` is injectable for tests.
 */
export const callLlm = async (
  billDetails: BillDetails,
  query: string,
  llmCallType: LlmCallType = "small",
  client: OpenAI = createClient()
): Promise<LlmResults> => {
  const response =
    llmCallType === "small"
      ? await chat(client, query)
      : await largeDocs(client, billDetails, query)
  return { query, response }
}
