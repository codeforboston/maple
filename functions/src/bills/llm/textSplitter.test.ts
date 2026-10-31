import { readFileSync } from "fs"
import { createHash } from "crypto"
import { join } from "path"
import { splitTextByCharacters, splitTextByTokens } from "./textSplitter"

// Expected values were produced by the LangChain splitters the Python
// implementation used (see `helpers.python.json`).
const fixture = JSON.parse(
  readFileSync(join(__dirname, "__fixtures__/helpers.python.json"), "utf8")
)

const sha = (s: string) => createHash("sha256").update(s).digest("hex")

describe("splitTextByCharacters", () => {
  it("matches CharacterTextSplitter on a small input", () => {
    const { text, chunkSize, chunkOverlap, chunks } = fixture.smallSplit
    expect(splitTextByCharacters(text, chunkSize, chunkOverlap)).toEqual(chunks)
  })

  it("matches CharacterTextSplitter at the production chunk size", () => {
    const paragraphs = Array.from(
      { length: fixture.bigSplit.paragraphs },
      (_, i) => `Paragraph ${i}: ${"lorem ipsum ".repeat((i % 50) + 1)}`
    ).join("\n\n")

    const chunks = splitTextByCharacters(paragraphs, 90000, 1000)

    expect(chunks).toHaveLength(fixture.bigSplit.chunkCount)
    expect(chunks.map(sha)).toEqual(fixture.bigSplit.chunkHashes)
  })

  it("returns no chunks for empty text", () => {
    expect(splitTextByCharacters("", 90000, 1000)).toEqual([])
  })
})

describe("splitTextByTokens", () => {
  it("matches TokenTextSplitter", () => {
    const { text, chunkSize, chunkOverlap, chunks } = fixture.tokenSplit
    expect(splitTextByTokens(text, chunkSize, chunkOverlap)).toEqual(chunks)
  })

  it("returns no chunks for empty text", () => {
    expect(splitTextByTokens("", 2000, 200)).toEqual([])
  })
})
