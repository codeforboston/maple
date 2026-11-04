import {
  AIMessage,
  HumanMessage,
  RemoveMessage,
  ToolMessage,
  type BaseMessage
} from "@langchain/core/messages"
import type { BaseChatModel } from "@langchain/core/language_models/chat_models"
import { ToolInputParsingException } from "@langchain/core/tools"
import type { BaseCheckpointSaver } from "@langchain/langgraph"
import {
  countTokensApproximately,
  createAgent,
  createMiddleware,
  dynamicSystemPromptMiddleware,
  modelRetryMiddleware,
  toolErrorMiddleware,
  toolRetryMiddleware,
  trimMessages
} from "langchain"
import { randomUUID } from "crypto"
import { z } from "zod"
import * as db from "./db"
import { isCancelRequested } from "./threads"
import { buildTools, UserId, userIdFrom } from "./tools"
import { mcpCaller, type McpCall } from "./mcp"

export const MAX_TOOL_CALLS_PER_TURN = 6
const HISTORY_TOKENS = 6000
// Notices the agent writes itself (budget, limit); never stored as memories.
const NOTICE = "ask_maple_notice"

// Anyone can create an account, so the per-user cap alone does not bound spend.
export const GLOBAL_BUDGET_MESSAGE =
  "Ask MAPLE has reached this month's question limit for everyone. Please try again next month."
export const BUDGET_MESSAGE = "You've reached this month's question limit."
export const LIMIT_MESSAGE =
  "I couldn't finish searching within the limit. Here's what I found so far:"
const CANCELLED = "Cancelled: the user stopped this answer before the tool ran."

// Started from the system prompt in #2218.
export const systemPrompt = (
  today: string
) => `You are Ask MAPLE, a guide to Massachusetts bills and the public testimony on them, for residents who are not policy experts. Today is ${today}.

- Answer only from what your tools return in this conversation. Never use outside knowledge about specific bills, sponsors or votes.
- Search before answering. Rephrase the resident's words into search terms (e.g. "my rent went up" → "rent increases, rent stabilization, tenant protections").
- Write 2-4 short plain-language sentences. Use **bold** sparingly and at most one short bullet list. No headings, tables or code.
- Cite bills inline as markdown links, e.g. [H.1440](/bills/192/H1440), using the court and id from tool results. Link only bills your tools returned.
- Don't repeat bill details (sponsor, committee, counts) that the bill cards under your answer already show, except to answer the question.
- Testimony counts describe who chose to testify, not public opinion overall.
- If nothing relevant came back, say so plainly and suggest one broader rephrase. Never guess.
- Use search_my_past_chats only when the resident refers to an earlier conversation. Never mention other users.`

// --- Pure helpers (unit-tested) ----------------------------------------------

const isHuman = (m: BaseMessage) => m.type === "human"
const isTool = (m: BaseMessage): m is ToolMessage => m.type === "tool"
const isAI = (m: BaseMessage): m is AIMessage => m.type === "ai"

/** Messages after the latest human message: the current turn. */
export function currentTurn(messages: BaseMessage[]): BaseMessage[] {
  const i = messages.findLastIndex(isHuman)
  return messages.slice(i + 1)
}

export function toolCallsThisTurn(messages: BaseMessage[]): number {
  return currentTurn(messages)
    .filter(isAI)
    .reduce((n, m) => n + (m.tool_calls?.length ?? 0), 0)
}

/** "court/id" keys of the bills that tool results returned, in order, deduplicated. */
export function billKeys(messages: BaseMessage[]): string[] {
  const keys = new Set<string>()
  for (const m of messages.filter(isTool)) {
    if (m.name !== "search_bills" && m.name !== "search_testimony") continue
    try {
      for (const r of JSON.parse(String(m.content)))
        keys.add(`${r.court}/${r.billId ?? r.id}`)
    } catch {
      // error ToolMessages are plain text
    }
  }
  return [...keys]
}

/** After Stop, an AI tool call can be left without its result; providers reject that history. */
export function danglingToolCalls(messages: BaseMessage[]): ToolMessage[] {
  const answered = new Set(messages.filter(isTool).map(m => m.tool_call_id))
  return messages
    .filter(isAI)
    .flatMap(m => m.tool_calls ?? [])
    .filter(tc => tc.id && !answered.has(tc.id))
    .map(
      tc =>
        new ToolMessage({
          content: CANCELLED,
          tool_call_id: tc.id!,
          name: tc.name
        })
    )
}

export function limitMessage(keys: string[]): string {
  if (keys.length === 0)
    return `${LIMIT_MESSAGE} nothing relevant yet. Try a narrower question.`
  const links = keys.map(k => {
    const [court, id] = k.split("/")
    return `- [${id.replace(/^([HS])(\d)/, "$1.$2")}](/bills/${court}/${id})`
  })
  return [LIMIT_MESSAGE, "", ...links.slice(0, 5)].join("\n")
}

// Gemini 3 can return content as blocks; .text joins the text parts.
const text = (m?: BaseMessage) => m?.text ?? ""

/** One memory row per answered turn: the question and the start of the answer. */
export function memoryContent(messages: BaseMessage[]): string | null {
  const q = messages.findLast(isHuman)
  // This turn's answer only: a turn ended by Stop has none, and must not pair with the last turn's.
  const a = currentTurn(messages).findLast(isAI)
  if (!q || !a || a.name === NOTICE || !text(a)) return null
  return `Q: ${text(q).slice(0, 500)}\nA: ${text(a).slice(0, 1000)}`
}

// --- Graph -------------------------------------------------------------------

export type GraphDeps = {
  model: string | BaseChatModel
  db: db.Queryable
  embed: db.EmbedFn
  /** MAPLE's MCP server, for bill, testimony and sponsor search. */
  mcp: McpCall
  monthlyBudget: number
  /** All users together, per month. */
  globalMonthlyBudget: number
  checkpointer?: BaseCheckpointSaver
  /** Runs once before the first turn (refuse to answer on an embedding mismatch). */
  startupCheck?: () => Promise<void>
}

export function buildGraph(deps: GraphDeps) {
  let started: Promise<void> | undefined

  const turnRules = createMiddleware({
    name: "AskMapleTurn",
    // Declared here so hooks (and the graph's context schema the AG-UI adapter reads) carry user_id.
    contextSchema: z.object({ user_id: UserId.optional() }),

    // prepare: user_id, budget, Stop clean-up.
    // Stop backup: the service sets cancel_requested; end the turn before the next model call.
    beforeModel: {
      canJumpTo: ["end"],
      hook: async (_state, runtime) => {
        const threadId = runtime.configurable?.thread_id
        const runId = runtime.configurable?.run_id
        if (
          typeof runId !== "string" ||
          !z.string().uuid().safeParse(threadId).success
        )
          return
        if (await isCancelRequested(deps.db, threadId as string, runId))
          return { jumpTo: "end" }
      }
    },

    beforeAgent: {
      canJumpTo: ["end"],
      hook: async (state, runtime) => {
        started ??= deps.startupCheck?.() ?? Promise.resolve()
        await started
        const userId = userIdFrom(runtime) // fails fast without a valid user_id

        if ((await db.monthTokens(deps.db, null)) >= deps.globalMonthlyBudget)
          return {
            messages: [
              new AIMessage({ content: GLOBAL_BUDGET_MESSAGE, name: NOTICE })
            ],
            jumpTo: "end"
          }
        if ((await db.monthTokens(deps.db, userId)) >= deps.monthlyBudget)
          return {
            messages: [
              new AIMessage({ content: BUDGET_MESSAGE, name: NOTICE })
            ],
            jumpTo: "end"
          }

        const patch = danglingToolCalls(state.messages)
        if (patch.length === 0) return
        // Cancelled results must sit before the new question, so move the question after them.
        const question = state.messages.at(-1)!
        return {
          messages: [
            new RemoveMessage({ id: question.id! }),
            ...patch,
            new HumanMessage({ content: question.content, id: randomUUID() })
          ]
        }
      }
    },

    // Usage per model call, then the 6-calls-per-turn limit.
    afterModel: {
      canJumpTo: ["end"],
      hook: async (state, runtime) => {
        const last = state.messages.at(-1)
        const userId = userIdFrom(runtime)
        const tokens =
          last && isAI(last) ? last.usage_metadata?.total_tokens ?? 0 : 0
        if (tokens > 0)
          await db
            .addUsage(deps.db, userId, tokens)
            .catch(err => console.error("usage write failed", err))

        if (toolCallsThisTurn(state.messages) <= MAX_TOOL_CALLS_PER_TURN) return
        // One batch can ask for more than is left (Gemini sent 8 parallel searches in E8b):
        // run what fits; the limit message comes only once nothing is left.
        const left =
          MAX_TOOL_CALLS_PER_TURN -
          toolCallsThisTurn(state.messages.slice(0, -1))
        if (left > 0 && last && isAI(last))
          return {
            messages: [
              new AIMessage({
                id: last.id, // same id: replaces the message in place
                content: last.content,
                additional_kwargs: last.additional_kwargs,
                response_metadata: last.response_metadata,
                usage_metadata: last.usage_metadata,
                tool_calls: last.tool_calls!.slice(0, left)
              })
            ]
          }
        return {
          messages: [
            new RemoveMessage({ id: last!.id! }),
            new AIMessage({
              content: limitMessage(billKeys(currentTurn(state.messages))),
              name: NOTICE
            })
          ],
          jumpTo: "end"
        }
      }
    },

    // remember: best-effort, never blocks the answer. Stopped runs are cancelled before this.
    afterAgent: async (state, runtime) => {
      const content = memoryContent(state.messages)
      const threadId = runtime.configurable?.thread_id
      const runId = String(
        runtime.configurable?.run_id ?? state.messages.findLast(isHuman)?.id
      )
      if (!content || !threadId) return
      try {
        await db.upsertMemory(deps.db, {
          userId: userIdFrom(runtime),
          threadId,
          runId,
          content,
          embedding: await deps.embed(content, "document")
        })
      } catch (err) {
        console.error("memory write failed", err)
      }
    },

    // Keep ~6k tokens of history, starting on a human turn so tool pairs stay whole.
    wrapModelCall: async (request, handler) =>
      handler({
        ...request,
        messages: await trimMessages(request.messages, {
          maxTokens: HISTORY_TOKENS,
          strategy: "last",
          tokenCounter: countTokensApproximately,
          startOn: "human",
          allowPartial: false
        })
      })
  })

  return createAgent({
    model: deps.model,
    tools: [...buildTools({ db: deps.db, embed: deps.embed, mcp: deps.mcp })],
    checkpointer: deps.checkpointer,
    middleware: [
      turnRules,
      dynamicSystemPromptMiddleware(() =>
        systemPrompt(new Date().toDateString())
      ),
      // "error": a failed answer must surface as a failed run (UI Retry), never as an AI message or memory.
      modelRetryMiddleware({
        maxRetries: 2,
        initialDelayMs: 1000,
        onFailure: "error"
      }),
      // Bad arguments go back to the model; other tool failures get one retry, then a safe message.
      toolErrorMiddleware({
        onError: err =>
          err instanceof ToolInputParsingException
            ? `Invalid arguments: ${err.message}`
            : String(err).includes("user_id")
            ? undefined
            : "The search failed. Try different words, or tell the resident it isn't available right now."
      }),
      toolRetryMiddleware({ maxRetries: 1, onFailure: "error" })
    ]
    // Each search round is several graph steps (model, tools and the middleware hooks), so
    // LangGraph's default limit of 25 ends a turn after about 3 searches. MAX_TOOL_CALLS_PER_TURN is
    // the real bound; this only stops a runaway loop.
  }).withConfig({ recursionLimit: 100 })
}

const required = (name: string) => {
  const v = process.env[name]
  if (!v) throw new Error(`${name} is not set`)
  return v
}

/** The production graph, configured from env. The Express service passes a PostgresSaver. */
export function graphFromEnv(checkpointer?: BaseCheckpointSaver) {
  const pool: db.Queryable = {
    query: (text, params) => db.getPool().query(text, params)
  }
  return buildGraph({
    model: `google-genai:${process.env.CHAT_MODEL}`,
    db: pool,
    embed: db.embed,
    mcp: mcpCaller(required("MAPLE_MCP_URL"), required("MAPLE_MCP_TOKEN")),
    monthlyBudget: Number(process.env.MONTHLY_TOKEN_BUDGET ?? 200_000),
    globalMonthlyBudget: Number(
      process.env.GLOBAL_MONTHLY_TOKEN_BUDGET ?? 2_000_000
    ),
    checkpointer,
    startupCheck: () => db.checkEmbeddingMeta(pool)
  })
}
