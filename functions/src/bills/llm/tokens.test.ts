import { readFileSync } from "fs"
import { join } from "path"
import { countTokens, getLlmCallType } from "./tokens"
import { emptyBillDetails } from "./types"

const fixture = JSON.parse(
  readFileSync(join(__dirname, "__fixtures__/helpers.python.json"), "utf8")
)

describe("countTokens", () => {
  it.each(fixture.tokenCounts as { text: string; tokens: number }[])(
    "matches tiktoken for %#",
    ({ text, tokens }) => {
      expect(countTokens("", text, "", "", "")).toBe(tokens)
    }
  )

  it("counts the concatenation of every piece", () => {
    expect(countTokens("hello", " world", "", "", "")).toBe(
      countTokens("", "hello world", "", "", "")
    )
  })

  it("counts special-token text as ordinary text", () => {
    expect(() => countTokens("", "<|endoftext|>", "", "", "")).not.toThrow()
  })
})

describe("getLlmCallType", () => {
  it("is small for an ordinary bill", () => {
    expect(
      getLlmCallType(emptyBillDetails({ billText: "An Act relative to cats" }))
    ).toBe("small")
  })

  it("is large when the referenced MGL text overflows the context window", () => {
    expect(
      getLlmCallType(emptyBillDetails({ mglRef: "word ".repeat(130000) }))
    ).toBe("large")
  })
})
