import { readFileSync } from "fs"
import { join } from "path"
import { PGlite } from "@electric-sql/pglite"
import { vector } from "@electric-sql/pglite-pgvector"
import {
  assertEmbeddingMeta,
  checkEmbeddingMeta,
  normalize,
  searchMemories,
  toVector,
  type EmbedFn
} from "../src/db"
import { buildTools } from "../src/tools"
import { fakeMcp } from "./fakeMcp"

const DIMS = 768
/** Unit vector pointing mostly at axis i, so nearest-neighbour order is predictable. */
const axis = (i: number) =>
  normalize(
    Array.from({ length: DIMS }, (_, j) => (j === i ? 1 : 0.001)),
    DIMS
  )

// Prefix-sharing ids: a LIKE/prefix bug would leak user A's rows to user B.
const USER_A = "uidPrefix1"
const USER_B = "uidPrefix12"

let pg: PGlite
const fakeEmbed: EmbedFn = async text => axis(text.includes("rent") ? 1 : 2)

beforeAll(async () => {
  pg = new PGlite({ extensions: { vector } })
  await pg.exec(readFileSync(join(__dirname, "../sql/001_schema.sql"), "utf8"))
  await pg.query(
    `insert into chat_memories (user_id, thread_id, run_id, content, embedding)
     values ($1, 'tA', 'r1', 'User A asked about rent increases', $2::vector)`,
    [USER_A, toVector(axis(1))]
  )
}, 60_000)

afterAll(() => pg.close())

const tools = () => {
  const [searchBills, searchTestimony, listSponsors, searchMyPastChats] =
    buildTools({ db: pg, embed: fakeEmbed, mcp: fakeMcp() })
  return { searchBills, searchTestimony, listSponsors, searchMyPastChats }
}

describe("embeddings", () => {
  test("model or dimension mismatch throws", async () => {
    const config = { model: "gemini-embedding-001", dims: 768 }
    expect(() =>
      assertEmbeddingMeta([{ table_name: "chat_memories", ...config }], config)
    ).not.toThrow()
    expect(() =>
      assertEmbeddingMeta(
        [
          {
            table_name: "chat_memories",
            model: "gemini-embedding-2",
            dims: 768
          }
        ],
        config
      )
    ).toThrow(/chat_memories/)
    expect(() =>
      assertEmbeddingMeta(
        [{ table_name: "chat_memories", model: config.model, dims: 1536 }],
        config
      )
    ).toThrow(/1536/)

    await pg.query(
      `insert into embedding_meta values ('chat_memories', 'other-model', 768)`
    )
    await expect(checkEmbeddingMeta(pg)).rejects.toThrow(/other-model/)
    await pg.query(`delete from embedding_meta`)
  })

  test("normalize rejects wrong length (a failed batch returns []) and yields unit vectors", () => {
    expect(() => normalize([], DIMS)).toThrow(/0 dims/)
    expect(Math.hypot(...normalize(Array(DIMS).fill(3), DIMS))).toBeCloseTo(1)
  })
})

describe("memory isolation (SQL level)", () => {
  test("a prefix-sharing user id gets none of the other user's memories", async () => {
    expect(await searchMemories(pg, USER_B, axis(1), { limit: 5 })).toEqual([])
    expect(
      await searchMemories(pg, USER_A, axis(1), { limit: 5 })
    ).toHaveLength(1)
  })

  test("search_my_past_chats reads user_id from config only", async () => {
    const { searchMyPastChats } = tools()
    const asB = await searchMyPastChats.invoke(
      { query: "rent" },
      { configurable: { user_id: USER_B } }
    )
    expect(JSON.parse(asB as string)).toEqual([])
    const asA = await searchMyPastChats.invoke(
      { query: "rent" },
      { configurable: { user_id: USER_A } }
    )
    expect(JSON.parse(asA as string)[0].content).toMatch(/rent/)
    await expect(
      searchMyPastChats.invoke({ query: "rent" }, { configurable: {} })
    ).rejects.toThrow(/user_id/)
  })
})

describe("tool argument limits", () => {
  test.each([
    ["query over 500 chars", { query: "x".repeat(501) }],
    ["empty query", { query: "   " }],
    ["limit over 8", { query: "rent", limit: 9 }],
    ["fractional limit", { query: "rent", limit: 2.5 }]
  ])("search_bills rejects %s", async (_name, args) => {
    await expect(tools().searchBills.invoke(args as any)).rejects.toThrow()
  })

  test("search_my_past_chats rejects a non-ISO date", async () => {
    await expect(
      tools().searchMyPastChats.invoke(
        { query: "rent", since: "last week" } as any,
        {
          configurable: { user_id: USER_A }
        }
      )
    ).rejects.toThrow()
  })
})

test("tool schemas have no $ref (Gemini rejects them with a 400)", () => {
  const { toJsonSchema } = require("@langchain/core/utils/json_schema")
  for (const t of buildTools({ db: pg, embed: fakeEmbed, mcp: fakeMcp() }))
    expect(JSON.stringify(toJsonSchema(t.schema))).not.toContain("$ref")
})
