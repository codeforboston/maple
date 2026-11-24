import type { ChatBill } from "./BillRecord"

/** The AG-UI message fields the chat reads (user, assistant with tool calls, tool results). */
export type AgUiMessage = {
  id: string
  role: string
  content?: unknown
  toolCalls?: { id: string; function: { name: string; arguments: string } }[]
  toolCallId?: string
}

export type Step = {
  name: string
  args: Record<string, unknown>
  /** Parsed JSON rows once the tool has returned; undefined while it runs or if it returned text. */
  rows?: any[]
  done: boolean
}

export type Turn = {
  id: string
  question: string
  steps: Step[]
  answer: string
  /** Bills the answer links to, from this or an earlier turn's search_bills results: cards come from tool results, never model text. */
  bills: ChatBill[]
  /** Searched for bills but the answer cites none. */
  noResults: boolean
}

const text = (content: unknown): string =>
  typeof content === "string"
    ? content
    : Array.isArray(content)
    ? content.map(p => (typeof p?.text === "string" ? p.text : "")).join("")
    : ""

const parse = <T>(s: string, fallback: T): T => {
  try {
    return JSON.parse(s)
  } catch {
    return fallback
  }
}

export function toTurns(messages: AgUiMessage[]): Turn[] {
  const results = new Map(
    messages
      .filter(m => m.role === "tool" && m.toolCallId)
      .map(m => [m.toolCallId!, text(m.content)])
  )
  const turns: Turn[] = []
  for (const m of messages) {
    if (m.role === "user") {
      turns.push({
        id: m.id,
        question: text(m.content),
        steps: [],
        answer: "",
        bills: [],
        noResults: false
      })
      continue
    }
    const turn = turns.at(-1)
    if (!turn || m.role !== "assistant") continue
    for (const tc of m.toolCalls ?? []) {
      const result = results.get(tc.id)
      const rows =
        result === undefined ? undefined : parse<unknown>(result, undefined)
      turn.steps.push({
        name: tc.function.name,
        args: parse(tc.function.arguments, {}),
        rows: Array.isArray(rows) ? rows : undefined,
        done: result !== undefined
      })
    }
    const said = text(m.content)
    if (said) turn.answer = said
  }

  // A follow-up may cite bills found in an earlier turn, so cards draw on every result so far.
  const known = new Map<string, ChatBill>()
  for (const turn of turns) {
    for (const b of turn.steps
      .filter(s => s.name === "search_bills")
      .flatMap(s => (s.rows ?? []) as ChatBill[]))
      known.set(`${b.court}/${b.id}`, b)
    // Match through the markdown link's ")" so 192/H1 doesn't match inside 192/H1440; order as cited.
    const at = (key: string) => turn.answer.indexOf(`/bills/${key})`)
    turn.bills = [...known.entries()]
      .filter(([key]) => at(key) >= 0)
      .sort(([a], [b]) => at(a) - at(b))
      .map(([, b]) => b)
    // Vector search always returns its top rows, so "nothing matched" means the answer cites none of them.
    const searched = turn.steps.some(s => s.name === "search_bills" && s.done)
    turn.noResults = searched && turn.answer !== "" && turn.bills.length === 0
  }
  return turns
}
