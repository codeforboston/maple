const mockSet = jest.fn()
const mockClose = jest.fn().mockResolvedValue(undefined)
const mockDoc = jest.fn((id: string) => ({ id }))
const mockRecursiveDelete = jest.fn().mockResolvedValue(undefined)
const mockCollection = jest.fn(() => ({ doc: mockDoc }))
const mockBulkWriter = jest.fn(() => ({ set: mockSet, close: mockClose }))

jest.mock("../firebase", () => ({
  db: {
    collection: mockCollection,
    recursiveDelete: mockRecursiveDelete,
    bulkWriter: mockBulkWriter
  }
}))

import {
  chunkDocumentText,
  clearDocumentTextBlocks,
  MAX_BLOCK_BYTES,
  MAX_INLINE_TEXT_BYTES,
  planDocumentTextStorage,
  writeDocumentTextBlocks
} from "./contentBlocks"

const byteLength = (s: string) => Buffer.byteLength(s, "utf8")

describe("chunkDocumentText", () => {
  it("keeps small text in a single chunk", () => {
    expect(chunkDocumentText("hello")).toEqual(["hello"])
  })

  it("splits ASCII text into byte-bounded chunks that rejoin exactly", () => {
    const text = "a".repeat(MAX_BLOCK_BYTES + 100)
    const chunks = chunkDocumentText(text)

    expect(chunks.length).toBe(2)
    chunks.forEach(c =>
      expect(byteLength(c)).toBeLessThanOrEqual(MAX_BLOCK_BYTES)
    )
    expect(chunks.join("")).toBe(text)
  })

  it("never splits a multi-byte code point", () => {
    // '€' is 3 UTF-8 bytes and does not divide evenly into the byte budget, so a
    // naive byte split would land mid-character.
    const text = "€".repeat(MAX_BLOCK_BYTES)
    const chunks = chunkDocumentText(text)

    expect(chunks.length).toBeGreaterThan(1)
    chunks.forEach(c => {
      expect(byteLength(c)).toBeLessThanOrEqual(MAX_BLOCK_BYTES)
      // A broken code point would surface as a replacement char on re-decode.
      expect(c).not.toContain("�")
    })
    expect(chunks.join("")).toBe(text)
  })

  it("never splits a surrogate pair (emoji)", () => {
    const text = "😀".repeat(300_000) // 4 bytes each → exceeds the byte budget
    const chunks = chunkDocumentText(text)

    expect(chunks.length).toBeGreaterThan(1)
    chunks.forEach(c =>
      expect(byteLength(c)).toBeLessThanOrEqual(MAX_BLOCK_BYTES)
    )
    expect(chunks.join("")).toBe(text)
  })
})

describe("planDocumentTextStorage", () => {
  it("returns inline (undefined) when there is no text", () => {
    expect(planDocumentTextStorage(undefined)).toEqual({ inline: undefined })
  })

  it("keeps text at or under the inline limit inline", () => {
    const text = "a".repeat(MAX_INLINE_TEXT_BYTES)
    expect(planDocumentTextStorage(text)).toEqual({ inline: text })
  })

  it("chunks text above the inline limit", () => {
    const text = "a".repeat(MAX_INLINE_TEXT_BYTES + 1)
    const plan = planDocumentTextStorage(text)

    expect(plan.inline).toBeUndefined()
    expect(plan.blocks).toBeDefined()
    expect(plan.blocks!.join("")).toBe(text)
  })
})

describe("writeDocumentTextBlocks", () => {
  beforeEach(() => jest.clearAllMocks())

  it("deletes existing blocks then writes new ordered chunks", async () => {
    await writeDocumentTextBlocks(194, "H5500", ["a", "b", "c"])

    expect(mockCollection).toHaveBeenCalledWith(
      "/generalCourts/194/bills/H5500/contentBlocks"
    )
    expect(mockRecursiveDelete).toHaveBeenCalled()
    expect(mockSet).toHaveBeenCalledTimes(3)
    expect(mockSet).toHaveBeenNthCalledWith(
      1,
      { id: "0" },
      { index: 0, text: "a" }
    )
    expect(mockSet).toHaveBeenNthCalledWith(
      3,
      { id: "2" },
      { index: 2, text: "c" }
    )
    expect(mockClose).toHaveBeenCalled()
  })
})

describe("clearDocumentTextBlocks", () => {
  beforeEach(() => jest.clearAllMocks())

  it("recursively deletes the subcollection", async () => {
    await clearDocumentTextBlocks(194, "H5500")

    expect(mockCollection).toHaveBeenCalledWith(
      "/generalCourts/194/bills/H5500/contentBlocks"
    )
    expect(mockRecursiveDelete).toHaveBeenCalled()
  })
})
