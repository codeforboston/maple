/**
 * Live evals E1-E8 against the chat-agent service. Structural checks only: tools
 * called, ids, links, isolation, resume. Text quality is read by hand from evals/results/latest.json.
 *
 *   yarn --cwd chat-agent evals            (needs `yarn --cwd chat-agent start` running,
 *                                            or CHAT_AGENT_URL pointing at a deployed service)
 */
import { randomUUID } from "crypto"
import { mkdirSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"
import type { BaseMessage } from "@langchain/core/messages"
import { getPool } from "../src/db"
import { billKeys } from "../src/graph"

const TRIALS = Number(process.env.EVAL_TRIALS ?? 3)
// Gemini 3.8 Flash paid tier through 2026-12-31, USD per 1M tokens (doubles 2027-01-01).
const PRICE = { input: 0.75, output: 3.75 }

const SERVICE = process.env.CHAT_AGENT_URL ?? "http://127.0.0.1:2024"
const call = (path: string, user: string, init: RequestInit = {}) =>
  fetch(SERVICE + path, {
    ...init,
    headers: {
      authorization: `Bearer ${process.env.AGENT_SERVICE_TOKEN ?? ""}`,
      "x-ask-maple-user": user,
      "content-type": "application/json"
    }
  })
const db = getPool()

/** AG-UI messages, as the service's history route returns them. */
type Msg = {
  id: string
  role: string
  content?: unknown
  toolCallId?: string
  toolCalls?: { id: string; function: { name: string; arguments: string } }[]
}

/** AG-UI events from an SSE response body. */
async function* sse(res: Response): AsyncGenerator<Record<string, any>> {
  const decoder = new TextDecoder()
  let buffer = ""
  for await (const bytes of res.body as unknown as AsyncIterable<Uint8Array>) {
    buffer += decoder.decode(bytes, { stream: true })
    let end
    while ((end = buffer.indexOf("\n\n")) >= 0) {
      const chunk = buffer.slice(0, end)
      buffer = buffer.slice(end + 2)
      if (chunk.startsWith("data: ")) yield JSON.parse(chunk.slice(6))
    }
  }
}

type Turn = {
  question: string
  answer: string
  tools: { name: string; args: Record<string, unknown> }[]
  links: string[]
  retrieved: string[]
  firstEventMs: number | null
  firstTokenMs: number | null
  totalMs: number
  tokens: { input: number; output: number }
  cost: number
  status: "answered" | "stopped" | "error"
  error?: string
}

const text = (c: unknown): string =>
  typeof c === "string"
    ? c
    : Array.isArray(c)
    ? c.map(p => p?.text ?? "").join("")
    : ""

/** E6's allowed set: bills the agent's own billKeys() reads from tool results, plus links in the
 * resident's recalled past answers (memory is retrieved data too). */
function retrieved(messages: Msg[]) {
  const toolName = new Map(
    messages
      .flatMap(m => m.toolCalls ?? [])
      .map(tc => [tc.id, tc.function.name])
  )
  const tools = messages
    .filter(m => m.role === "tool")
    .map(m => ({
      type: "tool",
      name: toolName.get(m.toolCallId!),
      content: text(m.content)
    }))
  return [
    ...new Set([
      ...billKeys(tools as unknown as BaseMessage[]),
      ...tools
        .filter(m => m.name === "search_my_past_chats")
        .flatMap(m => linksIn(m.content))
    ])
  ]
}

const linksIn = (answer: string) =>
  [...answer.matchAll(/\]\(\/bills\/(\d+)\/([A-Z0-9]+)\)/g)].map(
    m => `${m[1]}/${m[2]}`
  )

async function ask(
  threadId: string,
  userId: string,
  question: string,
  stopAfterMs?: number
): Promise<Turn> {
  const t0 = Date.now()
  let firstEventMs: number | null = null
  let firstTokenMs: number | null = null
  let status: Turn["status"] = "answered"
  let error: string | undefined
  const abort = new AbortController()
  const timer = stopAfterMs
    ? setTimeout(() => abort.abort(), stopAfterMs)
    : undefined
  let tokens = { input: 0, output: 0 }
  try {
    const res = await call("/runs", userId, {
      method: "POST",
      body: JSON.stringify({
        threadId,
        runId: randomUUID(),
        messages: [{ id: randomUUID(), role: "user", content: question }]
      }),
      signal: abort.signal
    })
    if (!res.ok) {
      status = "error"
      error = `HTTP ${res.status}`
    } else
      for await (const ev of sse(res)) {
        // First thing the UI can show after "started": a step line or the first answer token.
        if (ev.type !== "RUN_STARTED") firstEventMs ??= Date.now() - t0
        if (ev.type === "TEXT_MESSAGE_CONTENT") firstTokenMs ??= Date.now() - t0
        if (ev.type === "RUN_FINISHED") tokens = ev.result?.usage ?? tokens
        if (ev.type === "RUN_ERROR") {
          status = "error"
          error = ev.message
        }
      }
  } catch (err) {
    if (abort.signal.aborted) status = "stopped"
    else {
      status = "error"
      error = String(err)
    }
  } finally {
    clearTimeout(timer)
  }
  if (status === "stopped") await new Promise(r => setTimeout(r, 1500)) // let the abort land

  const messages: Msg[] = await (
    await call(`/threads/${threadId}/messages`, userId)
  ).json()
  const turn = messages.slice(messages.map(m => m.role).lastIndexOf("user") + 1)
  const assistants = turn.filter(m => m.role === "assistant")
  const answer = status === "answered" ? text(assistants.at(-1)?.content) : ""
  return {
    question,
    answer,
    tools: assistants
      .flatMap(m => m.toolCalls ?? [])
      .map(tc => ({
        name: tc.function.name,
        args: JSON.parse(tc.function.arguments)
      })),
    links: linksIn(answer),
    retrieved: retrieved(messages),
    firstEventMs,
    firstTokenMs,
    totalMs: Date.now() - t0,
    tokens,
    cost: (tokens.input * PRICE.input + tokens.output * PRICE.output) / 1e6,
    status,
    error
  }
}

// --- Checks from cases.json -----------------------------------------------------

type Expect = {
  toolsCalled?: string[]
  toolArgs?: Record<string, Record<string, unknown>>
  anyBillLinked?: string[]
  billLinked?: string[]
  mentions?: string[]
  saysNotFound?: boolean
  noBillLinked?: boolean
  linksPresent?: boolean
}

const NOT_FOUND =
  /couldn'?t find|could not find|found no|did ?n[o']t find|no (\w+ )?(bills|records|results)|not able to find|unable to find|don'?t (see|have)/i

function check(t: Turn, e: Expect): string[] {
  const fails: string[] = []
  const called = new Set(t.tools.map(x => x.name))
  const linked = new Set(t.links.map(k => k.split("/")[1]))
  if (t.status !== "answered") fails.push(`status ${t.status} ${t.error ?? ""}`)
  for (const name of e.toolsCalled ?? [])
    if (!called.has(name)) fails.push(`did not call ${name}`)
  for (const [name, args] of Object.entries(e.toolArgs ?? {}))
    if (
      !t.tools.some(
        x =>
          x.name === name &&
          Object.entries(args).every(([k, v]) => x.args[k] === v)
      )
    )
      fails.push(`no ${name} call with ${JSON.stringify(args)}`)
  if (e.anyBillLinked && !e.anyBillLinked.some(id => linked.has(id)))
    fails.push(`links none of ${e.anyBillLinked.join(",")}`)
  for (const id of e.billLinked ?? [])
    if (!linked.has(id)) fails.push(`does not link ${id}`)
  for (const word of e.mentions ?? [])
    if (!t.answer.toLowerCase().includes(word.toLowerCase()))
      fails.push(`does not mention "${word}"`)
  if (e.saysNotFound && !NOT_FOUND.test(t.answer))
    fails.push("does not say it found nothing")
  if (e.noBillLinked && linked.size)
    fails.push(`links ${[...linked].join(",")}`)
  if (e.linksPresent && !linked.size) fails.push("no links")
  return fails
}

/** E6: every inline bill link was returned by a tool in this thread. */
const e6 = (t: Turn) => t.links.filter(k => !t.retrieved.includes(k))

// --- Run -------------------------------------------------------------------------

type Row = {
  id: string
  trial: number
  pass: boolean
  fails: string[]
  turns: Turn[]
}

/** A throwaway uid; the service takes any well-formed uid from the trusted caller. */
const user = (id?: string) => id ?? `eval-${randomUUID()}`

async function thread(owner: string): Promise<string> {
  const res = await call("/threads", owner, {
    method: "POST",
    body: JSON.stringify({ title: "eval" })
  })
  return (await res.json()).id
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  return s.length
    ? s.length % 2
      ? s[(s.length - 1) / 2]
      : (s[s.length / 2 - 1] + s[s.length / 2]) / 2
    : NaN
}

async function main() {
  const { cases } = JSON.parse(
    readFileSync(join(__dirname, "cases.json"), "utf8")
  )
  const rows: Row[] = []
  const userA = user()
  // E5: B is A's id plus one character, so a prefix/LIKE bug would leak.
  const userB = user(userA + "b")
  const threads: string[] = []
  const fresh = async (owner: string) => {
    const id = await thread(owner)
    threads.push(id)
    return id
  }

  try {
    for (const c of cases) {
      for (let trial = 1; trial <= TRIALS; trial++) {
        const tid = await fresh(userA)
        const turns: Turn[] = []
        for (const q of c.turns) turns.push(await ask(tid, userA, q))
        const fails =
          c.id === "E4"
            ? [
                ...check(turns[0], c.expect.turn1).map(f => `turn1: ${f}`),
                ...check(turns[1], c.expect.turn2).map(f => `turn2: ${f}`)
              ]
            : check(turns[0], c.expect)
        for (const t of turns)
          for (const k of e6(t))
            fails.push(`E6: links ${k}, which no tool returned`)
        rows.push({ id: c.id, trial, pass: fails.length === 0, fails, turns })
        console.log(
          `${c.id} #${trial} ${
            fails.length ? "FAIL " + fails.join("; ") : "pass"
          }`
        )
      }
    }

    // E5: memory isolation. A's rent question is remembered for A, invisible to B.
    {
      const recall = "What did I ask you about in an earlier conversation?"
      const turnA = await ask(await fresh(userA), userA, recall)
      const turnB = await ask(await fresh(userB), userB, recall)
      const fails: string[] = []
      if (!turnB.tools.some(x => x.name === "search_my_past_chats"))
        fails.push("B did not call search_my_past_chats")
      if (/rent|tenant|school meal|ratepayer/i.test(turnB.answer))
        fails.push("B's answer mentions A's topics")
      if (!/rent|tenant|school|ratepayer|wildlife|sponsor/i.test(turnA.answer))
        fails.push("control: A's own memory not recalled")
      rows.push({
        id: "E5",
        trial: 1,
        pass: fails.length === 0,
        fails,
        turns: [turnA, turnB]
      })
      console.log(`E5 ${fails.length ? "FAIL " + fails.join("; ") : "pass"}`)
    }

    // E8a: Stop mid-answer, ask again: the new question answers and the stopped turn leaves no memory.
    {
      const tid = await fresh(userA)
      const memories = async () =>
        (
          await db.query(
            `select count(*)::int as n from chat_memories where thread_id = $1`,
            [tid]
          )
        ).rows[0].n
      const stopped = await ask(
        tid,
        userA,
        "What bills are there about rent stabilization?",
        2500
      )
      // Stop as the site does: drop the stream and set the cancel flag. On Cloud Run the dropped
      // connection never reaches the service, so the flag is what ends the run.
      await call(`/threads/${tid}/stop`, userA, { method: "POST" })
      const afterStop = await memories()
      const again = await ask(
        tid,
        userA,
        "Are there bills about free school meals?"
      )
      const fails: string[] = []
      if (stopped.status !== "stopped")
        fails.push(`first turn was ${stopped.status}, not stopped`)
      if (afterStop !== 0)
        fails.push(`stopped turn wrote ${afterStop} memory rows`)
      if (again.status !== "answered" || !again.answer)
        fails.push(`ask-again ${again.status} ${again.error ?? ""}`)
      if ((await memories()) !== 1)
        fails.push("answered turn did not write exactly one memory row")
      rows.push({
        id: "E8a stop",
        trial: 1,
        pass: !fails.length,
        fails,
        turns: [stopped, again]
      })
      console.log(`E8a ${fails.length ? "FAIL " + fails.join("; ") : "pass"}`)
    }

    // E8b: a question that tempts many searches; if the 6-call limit fires, the thread still answers next.
    {
      const tid = await fresh(userA)
      const wide = await ask(
        tid,
        userA,
        "Search separately for bills on each of these: rent, school meals, wildlife, pesticides, noise, sick leave, transit, and voting. List one bill for each."
      )
      const limited = wide.answer.startsWith(
        "I couldn't finish searching within the limit"
      )
      const next = await ask(
        tid,
        userA,
        "Which one of those is about wildlife?"
      )
      const fails: string[] = []
      if (wide.tools.length > 6)
        fails.push(`${wide.tools.length} tool calls ran in one turn`)
      if (next.status !== "answered" || !next.answer)
        fails.push(`follow-up ${next.status}`)
      rows.push({
        id: limited ? "E8b limit" : "E8b limit (not triggered)",
        trial: 1,
        pass: !fails.length,
        fails,
        turns: [wide, next]
      })
      console.log(
        `E8b limit ${limited ? "fired" : "did not fire"} (${
          wide.tools.length
        } calls) ${fails.length ? "FAIL " + fails.join("; ") : "pass"}`
      )
    }
  } finally {
    for (const table of [
      "checkpoint_writes",
      "checkpoint_blobs",
      "checkpoints"
    ])
      await db.query(`delete from ${table} where thread_id = any($1::text[])`, [
        threads
      ])
    for (const [table, column] of [
      ["chat_threads", "owner"],
      ["chat_memories", "user_id"],
      ["usage", "user_id"]
    ])
      await db.query(`delete from ${table} where ${column} = any($1::text[])`, [
        [userA, userB]
      ])
  }

  const answered = rows
    .flatMap(r => r.turns)
    .filter(t => t.status === "answered")
  const summary = {
    when: new Date().toISOString(),
    model: process.env.CHAT_MODEL,
    trials: TRIALS,
    passRate: Object.fromEntries(
      [...new Set(rows.map(r => r.id))].map(id => {
        const rs = rows.filter(r => r.id === id)
        return [id, `${rs.filter(r => r.pass).length}/${rs.length}`]
      })
    ),
    e6Violations: answered.flatMap(e6),
    e7: {
      answers: answered.length,
      medianFirstEventMs: median(
        answered.flatMap(t => (t.firstEventMs == null ? [] : [t.firstEventMs]))
      ),
      medianFirstTokenMs: median(
        answered.flatMap(t => (t.firstTokenMs == null ? [] : [t.firstTokenMs]))
      ),
      medianTotalMs: median(answered.map(t => t.totalMs)),
      medianCostUsd: median(answered.map(t => t.cost)),
      maxCostUsd: Math.max(...answered.map(t => t.cost)),
      medianTokens: {
        input: median(answered.map(t => t.tokens.input)),
        output: median(answered.map(t => t.tokens.output))
      }
    }
  }
  mkdirSync(join(__dirname, "results"), { recursive: true })
  writeFileSync(
    join(__dirname, "results", "latest.json"),
    JSON.stringify({ summary, rows }, null, 2)
  )
  console.log(JSON.stringify(summary, null, 2))
  await db.end()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
