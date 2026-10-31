import { readFileSync } from "fs"
import { join } from "path"
import * as prompts from "./prompts"
import { formatPrompt } from "./prompts"

// Rendered from `llm/prompts.py` so the TypeScript port can be checked
// against the original prompts byte for byte.
const fixture: {
  values: Record<string, string>
  templates: Record<string, string>
  rendered: Record<string, string>
} = JSON.parse(
  readFileSync(join(__dirname, "__fixtures__/prompts.python.json"), "utf8")
)

const templateNames = Object.keys(fixture.templates)

describe("prompts", () => {
  it.each(templateNames)("%s matches the Python source", name => {
    expect((prompts as Record<string, unknown>)[name]).toBe(
      fixture.templates[name]
    )
  })

  it.each(templateNames)("%s renders the same as the Python source", name => {
    const template = fixture.templates[name]
    expect(formatPrompt(template, fixture.values)).toBe(fixture.rendered[name])
  })
})

describe("formatPrompt", () => {
  it("does not reinterpret placeholders inside substituted values", () => {
    expect(formatPrompt("a {x} b {y}", { x: "{y}", y: "z" })).toBe("a {y} b z")
  })

  it("throws on a missing value", () => {
    expect(() => formatPrompt("a {x}", {})).toThrow(
      "Missing value for prompt placeholder {x}"
    )
  })
})
