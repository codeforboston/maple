/**
 * Ask MAPLE agent service, mirroring mcp-server's Express-on-Cloud-Run shape.
 *   PORT  defaults to 2024
 *   HOST  defaults to 127.0.0.1 (use 0.0.0.0 on Cloud Run)
 *   AGENT_SERVICE_TOKEN  bearer token the Next.js server sends (required, ≥32 chars)
 */
import { EventType, type BaseEvent } from "@ag-ui/core"
import { EventEncoder } from "@ag-ui/encoder"
import { HumanMessage, type BaseMessage } from "@langchain/core/messages"
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres"
import { randomUUID, timingSafeEqual } from "crypto"
import express, {
  type NextFunction,
  type Request,
  type Response
} from "express"
import { z } from "zod"
import { textOf, toAgUiEvents, toAgUiMessages } from "./agui"
import { getPool, type Queryable } from "./db"
import { graphFromEnv } from "./graph"
import * as threads from "./threads"
import { UserId } from "./tools"

type Graph = ReturnType<typeof graphFromEnv>

/** createAgent's getState type resolves to never; the checkpoint holds the messages list. */
const threadMessages = async (graph: Graph, threadId: string) =>
  (
    (await graph.getState({ configurable: { thread_id: threadId } })) as {
      values?: { messages?: BaseMessage[] }
    }
  ).values?.messages ?? []

/** Tokens this turn's model calls used (everything after the newest human message). */
function turnUsage(messages: BaseMessage[]) {
  const turn = messages.slice(
    messages.map(m => m.type).lastIndexOf("human") + 1
  )
  return turn.reduce(
    (sum, m) => {
      const u = (
        m as {
          usage_metadata?: { input_tokens?: number; output_tokens?: number }
        }
      ).usage_metadata
      return {
        input: sum.input + (u?.input_tokens ?? 0),
        output: sum.output + (u?.output_tokens ?? 0)
      }
    },
    { input: 0, output: 0 }
  )
}

const Uuid = z.string().uuid()
const MAX_QUESTION = 4000
const CANCEL_POLL_MS = Number(process.env.CANCEL_POLL_MS ?? 1000)
const STOP_WAIT_MS = 5000

const RunInput = z
  .object({
    threadId: Uuid,
    runId: z.string().min(1).max(128),
    messages: z
      .array(z.object({ role: z.string(), content: z.unknown() }).passthrough())
      .max(500)
  })
  .passthrough()

function sameToken(header: string | undefined, token: string): boolean {
  const given = Buffer.from(
    header?.startsWith("Bearer ") ? header.slice(7) : ""
  )
  const want = Buffer.from(token)
  return given.length === want.length && timingSafeEqual(given, want)
}

/** Express 4 does not catch rejected promises; send 500 instead of hanging the request. */
const route =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response) =>
    fn(req, res).catch(err => {
      console.error(err)
      if (!res.headersSent) res.status(500).end()
      else res.end()
    })

export function createApp({
  db,
  graph,
  token
}: {
  db: Queryable
  graph: Graph
  token: string
}) {
  const app = express()
  // Not /healthz: Cloud Run reserves paths ending in "z" and never forwards them.
  app.get("/health", (_req, res) => res.json({ ok: true }))

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!sameToken(req.header("authorization"), token))
      return res.status(401).end()
    const user = req.header("x-ask-maple-user")
    if (!UserId.safeParse(user).success) return res.status(400).end()
    res.locals.user = user
    next()
  })
  // After the token check, so unauthenticated callers never get a 1 MB body parsed.
  app.use(express.json({ limit: "1mb" }))

  /** The caller's own thread, or 404 (other users' threads look like missing ones). */
  async function owned(id: string, res: Response) {
    const thread = Uuid.safeParse(id).success
      ? await threads.getThread(db, id)
      : null
    if (!thread || thread.owner !== res.locals.user) {
      res.status(404).end()
      return null
    }
    return thread
  }

  app.get(
    "/threads",
    route(async (_req, res) =>
      res.json(await threads.listThreads(db, res.locals.user))
    )
  )

  app.post(
    "/threads",
    route(async (req, res) => {
      const body = z
        .object({ title: z.string().trim().min(1).max(2000) })
        .safeParse(req.body)
      if (!body.success) return res.status(400).end()
      res.status(201).json({
        id: await threads.createThread(db, res.locals.user, body.data.title)
      })
    })
  )

  app.get(
    "/threads/:id",
    route(async (req, res) => {
      const thread = await owned(req.params.id, res)
      if (thread) res.json(thread)
    })
  )

  app.get(
    "/threads/:id/messages",
    route(async (req, res) => {
      if (!(await owned(req.params.id, res))) return
      res.json(toAgUiMessages(await threadMessages(graph, req.params.id)))
    })
  )

  app.post(
    "/threads/:id/stop",
    route(async (req, res) => {
      if (!(await owned(req.params.id, res))) return
      await threads.requestCancel(db, req.params.id)
      // Cloud Run never tells the service a client went away, so the run stops on the cancel poll.
      // Wait for it to let go of the thread: asking again right after Stop must not get 409.
      await threads.waitUntilIdle(db, req.params.id, STOP_WAIT_MS)
      res.status(204).end()
    })
  )

  app.post(
    "/runs",
    route(async (req, res) => {
      const input = RunInput.safeParse(req.body)
      if (!input.success) return res.status(400).end()
      const { threadId, runId, messages } = input.data
      if (!(await owned(threadId, res))) return

      // Only the newest user message is taken from the client; earlier history comes from the
      // checkpoint, so a client cannot inject or rewrite it.
      const newest = messages.filter(m => m.role === "user").at(-1)
      const question = textOf(newest?.content).trim()
      if (!question || question.length > MAX_QUESTION)
        return res.status(400).end()

      // Keep the browser's id for the question so the closing snapshot matches the message it
      // already shows. Never reuse an id the thread holds: the reducer would overwrite that message.
      const known = new Set(
        (await threadMessages(graph, threadId)).map(m => m.id)
      )
      const messageId =
        typeof newest?.id === "string" &&
        newest.id.length <= 128 &&
        !known.has(newest.id)
          ? newest.id
          : randomUUID()

      if (!(await threads.claimRun(db, threadId, runId)))
        return res.status(409).json({ code: "THREAD_ALREADY_RUNNING" })

      // Always SSE text: the encoder would label protobuf for permissive Accept headers.
      const encoder = new EventEncoder()
      res.status(200).set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
      })
      res.flushHeaders()
      const send = (event: BaseEvent) => res.write(encoder.encodeSSE(event))

      // Stop: the client closing the stream aborts the graph mid-run.
      const abort = new AbortController()
      res.on("close", () => {
        if (!res.writableFinished) abort.abort()
      })
      // Stop that doesn't close this stream (CopilotKit's runtime keeps it open, or another
      // instance got the Stop): the cancel flag set by POST /threads/:id/stop aborts the run.
      const cancelPoll = setInterval(() => {
        threads
          .isCancelRequested(db, threadId, runId)
          .then(cancel => cancel && abort.abort())
          .catch(err => console.error("cancel check failed", err))
      }, CANCEL_POLL_MS)

      try {
        send({ type: EventType.RUN_STARTED, threadId, runId } as BaseEvent)
        const stream = await graph.stream(
          {
            messages: [new HumanMessage({ id: messageId, content: question })]
          },
          {
            configurable: { thread_id: threadId, run_id: runId },
            context: { user_id: res.locals.user },
            streamMode: ["messages", "updates"],
            signal: abort.signal
          }
        )
        for await (const event of toAgUiEvents(
          stream as AsyncIterable<[string, unknown]>
        ))
          send(event)
        const messages = await threadMessages(graph, threadId)
        send({
          type: EventType.MESSAGES_SNAPSHOT,
          messages: toAgUiMessages(messages)
        } as BaseEvent)
        send({
          type: EventType.RUN_FINISHED,
          threadId,
          runId,
          result: { usage: turnUsage(messages) } // for evals' cost measurement
        } as BaseEvent)
      } catch (err) {
        if (!abort.signal.aborted) {
          console.error("run failed", err)
          send({
            type: EventType.RUN_ERROR,
            message: "The agent couldn't answer.",
            code: "AGENT_ERROR"
          } as BaseEvent)
        }
      } finally {
        clearInterval(cancelPoll)
        await threads
          .releaseRun(db, threadId, runId)
          .catch(err => console.error(err))
        res.end()
      }
    })
  )

  return app
}

if (require.main === module) {
  const token = process.env.AGENT_SERVICE_TOKEN ?? ""
  if (token.length < 32)
    throw new Error("AGENT_SERVICE_TOKEN must be set (32+ characters)")
  const pool = getPool()
  const app = createApp({
    db: pool,
    graph: graphFromEnv(new PostgresSaver(pool)),
    token
  })
  const port = Number(process.env.PORT ?? 2024)
  const host = process.env.HOST ?? "127.0.0.1"
  app.listen(port, host, () =>
    console.log(`chat-agent listening on http://${host}:${port}`)
  )
}
