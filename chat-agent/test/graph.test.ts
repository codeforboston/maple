import { readFileSync } from "fs"
import { join } from "path"
import { PGlite } from "@electric-sql/pglite"
import { vector } from "@electric-sql/pglite-pgvector"
import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages"
import { fakeModel } from "@langchain/core/testing"
import { MemorySaver } from "@langchain/langgraph"
import { normalize, type EmbedFn } from "../src/db"
import { fakeMcp } from "./fakeMcp"
import {
  BUDGET_MESSAGE,
  GLOBAL_BUDGET_MESSAGE,
  LIMIT_MESSAGE,
  billKeys,
  buildGraph,
  danglingToolCalls,
  limitMessage,
  memoryContent
} from "../src/graph"

const DIMS = 768
const vec = (i: number) =>
  normalize(
    Array.from({ length: DIMS }, (_, j) => (j === i ? 1 : 0.001)),
    DIMS
  )
const embed: EmbedFn = async () => vec(1)
const USER = "uidUser22222222222222222222"
const BUDGET = 1000

let pg: PGlite
beforeAll(async () => {
  pg = new PGlite({ extensions: { vector } })
  await pg.exec(readFileSync(join(__dirname, "../sql/001_schema.sql"), "utf8"))
}, 60_000)
afterAll(() => pg.close())
afterEach(async () => {
  await pg.exec("delete from usage; delete from chat_memories;")
})

const usage = (total: number) => ({
  input_tokens: total - 5,
  output_tokens: 5,
  total_tokens: total
})
const graphWith = (model: ReturnType<typeof fakeModel>) =>
  buildGraph({
    model,
    db: pg,
    embed,
    mcp: fakeMcp(),
    monthlyBudget: BUDGET,
    globalMonthlyBudget: BUDGET * 3,
    checkpointer: new MemorySaver()
  })
const config = (
  thread: string,
  extra: Record<string, unknown> = { user_id: USER }
) => ({
  configurable: { thread_id: thread, ...extra }
})
const search = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    name: "search_bills",
    args: { query: `rent ${i}` }
  }))

test("tool loop: search, answer, usage per model call, one memory row", async () => {
  const model = fakeModel()
    .respond(
      new AIMessage({
        content: "",
        tool_calls: [{ id: "c1", ...search(1)[0] }],
        usage_metadata: usage(40)
      })
    )
    .respond(
      new AIMessage({
        content: "Yes: [H.1440](/bills/192/H1440) would stabilize rents.",
        usage_metadata: usage(60)
      })
    )

  const out = await graphWith(model).invoke(
    { messages: [new HumanMessage("my rent went up")] },
    config("t-loop")
  )

  expect(out.messages.at(-1)?.content).toMatch(/H\.1440/)
  const tool = out.messages.find(m => m.type === "tool") as ToolMessage
  expect(JSON.parse(String(tool.content))[0]).toMatchObject({
    id: "H1440",
    testimonyCounts: { support: 0 }
  })
  expect((await pg.query(`select tokens::int from usage`)).rows).toEqual([
    { tokens: 100 }
  ])
  const mem = (
    await pg.query<{ content: string }>(
      `select thread_id, content from chat_memories`
    )
  ).rows
  expect(mem).toHaveLength(1)
  expect(mem[0].content).toMatch(/^Q: my rent went up\nA: Yes/)
})

test("limit: a batch that passes 6 runs only what fits; asking for more ends the turn", async () => {
  const model = fakeModel()
    .respondWithTools(search(4))
    .respondWithTools(search(3)) // 4 + 3 > 6: trimmed to 2
    .respondWithTools(search(1)) // nothing left: limit message
    .respond(new AIMessage("should never be reached"))

  const out = await graphWith(model).invoke(
    { messages: [new HumanMessage("everything about rent")] },
    config("t-limit")
  )

  const last = out.messages.at(-1)!
  expect(String(last.content)).toContain(LIMIT_MESSAGE)
  expect(String(last.content)).toContain("[H.1440](/bills/192/H1440)")
  expect(out.messages.filter(m => m.type === "tool")).toHaveLength(6)
  expect(danglingToolCalls(out.messages)).toHaveLength(0)
  expect(model.calls).toHaveLength(3)
})

test("six searches one after another, then an answer, fit in one run", async () => {
  let model = fakeModel()
  for (let i = 0; i < 6; i++) model = model.respondWithTools(search(1))
  model = model.respond(new AIMessage("Done: [H.1440](/bills/192/H1440)."))

  const out = await graphWith(model).invoke(
    { messages: [new HumanMessage("keep looking")] },
    config("t-sequential")
  )

  expect(String(out.messages.at(-1)?.content)).toMatch(/^Done/)
  expect(out.messages.filter(m => m.type === "tool")).toHaveLength(6)
})

test("limit: one batch of 8 parallel calls runs 6, then the model answers (E8b)", async () => {
  const model = fakeModel()
    .respondWithTools(search(8))
    .respond(new AIMessage("Here is one bill per topic."))

  const out = await graphWith(model).invoke(
    { messages: [new HumanMessage("search 8 topics")] },
    config("t-batch")
  )

  expect(out.messages.filter(m => m.type === "tool")).toHaveLength(6)
  expect(out.messages.at(-1)?.content).toBe("Here is one bill per topic.")
  expect(danglingToolCalls(out.messages)).toHaveLength(0)
})

test("over budget: polite notice, no model call, no memory", async () => {
  await pg.query(
    `insert into usage values ($1, date_trunc('month', now())::date, $2)`,
    [USER, BUDGET]
  )
  const model = fakeModel().respond(new AIMessage("should not run"))

  const out = await graphWith(model).invoke(
    { messages: [new HumanMessage("hi")] },
    config("t-budget")
  )

  expect(out.messages.at(-1)?.content).toBe(BUDGET_MESSAGE)
  expect(model.calls).toHaveLength(0)
  expect((await pg.query(`select * from chat_memories`)).rows).toHaveLength(0)
})

test("after Stop, a dangling tool call is cancelled before the new question", async () => {
  const model = fakeModel().respond(new AIMessage("Answer"))
  const stopped = new AIMessage({
    content: "",
    tool_calls: [{ id: "x1", name: "search_bills", args: { query: "rent" } }]
  })

  await graphWith(model).invoke(
    {
      messages: [
        new HumanMessage("first"),
        stopped,
        new HumanMessage("ask again")
      ]
    },
    config("t-stop")
  )

  const sent = model.calls[0].messages.map(
    m =>
      `${m.type}:${
        m.type === "tool" ? (m as ToolMessage).tool_call_id : m.content
      }`
  )
  expect(sent.slice(-4)).toEqual([
    "human:first",
    "ai:",
    "tool:x1",
    "human:ask again"
  ])
})

test("a run without user_id fails fast", async () => {
  const model = fakeModel().respond(new AIMessage("nope"))
  await expect(
    graphWith(model).invoke(
      { messages: [new HumanMessage("hi")] },
      config("t-nouser", {})
    )
  ).rejects.toThrow(/user_id/)
  expect(model.calls).toHaveLength(0)
})

describe("helpers", () => {
  test("billKeys reads bills and testimony results, skips error text", () => {
    const msgs = [
      new ToolMessage({
        tool_call_id: "a",
        name: "search_bills",
        content: JSON.stringify([{ court: 192, id: "H1" }])
      }),
      new ToolMessage({
        tool_call_id: "b",
        name: "search_testimony",
        content: JSON.stringify([{ court: 192, billId: "S2" }])
      }),
      new ToolMessage({
        tool_call_id: "c",
        name: "search_bills",
        content: "The search failed."
      })
    ]
    expect(billKeys(msgs)).toEqual(["192/H1", "192/S2"])
  })

  test("limit message with nothing found still reads as a sentence", () => {
    expect(limitMessage([])).toMatch(/nothing relevant yet/)
  })

  test("notices are not remembered", () => {
    const msgs = [
      new HumanMessage("hi"),
      new AIMessage({ content: BUDGET_MESSAGE, name: "ask_maple_notice" })
    ]
    expect(memoryContent(msgs)).toBeNull()
  })
})

test("user_id also arrives as LangGraph context (the AG-UI path)", async () => {
  const model = fakeModel()
    .respondWithTools([
      { name: "search_my_past_chats", args: { query: "rent" } }
    ])
    .respond(new AIMessage("ok"))
  const out = await graphWith(model).invoke(
    { messages: [new HumanMessage("what did I ask before?")] },
    { configurable: { thread_id: "t-ctx" }, context: { user_id: USER } }
  )
  expect(out.messages.at(-1)?.content).toBe("ok")
  const tool = out.messages.find(m => m.type === "tool")!
  expect(JSON.parse(String(tool.content))).toEqual([]) // the tool saw user_id: no error text
})

test("the budget notice matches the UI's chat.json copy (the page detects it by text)", () => {
  const chat = JSON.parse(
    readFileSync(join(__dirname, "../../public/locales/en/chat.json"), "utf8")
  )
  expect(BUDGET_MESSAGE).toBe(chat.budget.reached)
})

test("global cap: many users together cannot pass the monthly ceiling", async () => {
  const others = ["uidOther1", "uidOther2", "uidOther3"]
  for (const id of others) {
    await pg.query(
      `insert into usage values ($1, date_trunc('month', now())::date, $2)`,
      [id, BUDGET]
    )
  }
  const model = fakeModel().respond(new AIMessage("should not run"))

  const out = await graphWith(model).invoke(
    { messages: [new HumanMessage("hi")] },
    config("t-global")
  )

  expect(out.messages.at(-1)?.content).toBe(GLOBAL_BUDGET_MESSAGE)
  expect(model.calls).toHaveLength(0)
})
