import { toTurns, type AgUiMessage } from "./turns"

const bill = (id: string) => ({
  id,
  court: 192,
  title: `Bill ${id}`,
  primarySponsor: null,
  committee: null,
  testimonyCounts: { support: 0, oppose: 0, neutral: 0 }
})

const search = (callId: string, rows: unknown[]): AgUiMessage[] => [
  {
    id: `a-${callId}`,
    role: "assistant",
    toolCalls: [
      {
        id: callId,
        function: { name: "search_bills", arguments: '{"query":"rent"}' }
      }
    ]
  },
  {
    id: `t-${callId}`,
    role: "tool",
    toolCallId: callId,
    content: JSON.stringify(rows)
  }
]

test("cards: only cited bills, in citation order, including ones found in an earlier turn", () => {
  const turns = toTurns([
    { id: "u1", role: "user", content: "rent?" },
    ...search("c1", [bill("H1"), bill("H1440"), bill("S886")]),
    { id: "a1", role: "assistant", content: "See [H.1440](/bills/192/H1440)." },
    { id: "u2", role: "user", content: "senate version?" },
    ...search("c2", [bill("S889")]),
    {
      id: "a2",
      role: "assistant",
      content: "[S.889](/bills/192/S889) and [S.886](/bills/192/S886)."
    }
  ])
  expect(turns[0].bills.map(b => b.id)).toEqual(["H1440"]) // not H1, whose key is a prefix
  expect(turns[1].bills.map(b => b.id)).toEqual(["S889", "S886"])
  expect(turns[1].steps[0]).toMatchObject({
    name: "search_bills",
    done: true,
    args: { query: "rent" }
  })
})

test("no results: searched, answered, cited nothing", () => {
  const [turn] = toTurns([
    { id: "u1", role: "user", content: "bike lanes?" },
    ...search("c1", [bill("H9")]),
    {
      id: "a1",
      role: "assistant",
      content: "I couldn't find bills about that."
    }
  ])
  expect(turn.noResults).toBe(true)
  expect(turn.bills).toEqual([])
})

test("a tool still running has no rows yet", () => {
  const [turn] = toTurns([
    { id: "u1", role: "user", content: "rent?" },
    search("c1", [])[0]
  ])
  expect(turn.steps[0].done).toBe(false)
  expect(turn.noResults).toBe(false)
})
