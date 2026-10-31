import { normalizeSummary } from "./normalizeSummary"

describe("normalizeSummary", () => {
  it("handles summary prefix and bullets", () => {
    const summary = `Summary:  
- The bill allows Joe, the chief of police in Gravity, to continue working.    
- The city can require annual health examinations   
    `
    expect(normalizeSummary(summary)).toBe(
      "The bill allows Joe, the chief of police in Gravity, to continue working. The city can require annual health examinations"
    )
  })

  it("handles summary prefix and no bullets", () => {
    const summary = `Summary:  
The bill allows Joe, the chief of police in Gravity, to continue working.    
    `
    expect(normalizeSummary(summary)).toBe(
      "The bill allows Joe, the chief of police in Gravity, to continue working."
    )
  })

  it("handles summary prefix with no linebreak", () => {
    const summary =
      "Summary: The bill allows Joe, the chief of police in Gravity, to continue working."
    expect(normalizeSummary(summary)).toBe(
      "The bill allows Joe, the chief of police in Gravity, to continue working."
    )
  })

  it("handles a bare summary", () => {
    const summary =
      "The bill allows Joe, the chief of police in Gravity, to continue working."
    expect(normalizeSummary(summary)).toBe(
      "The bill allows Joe, the chief of police in Gravity, to continue working."
    )
  })

  it("handles Windows line endings", () => {
    expect(normalizeSummary("Summary:\r\n- One\r\n- Two")).toBe("One Two")
  })
})
