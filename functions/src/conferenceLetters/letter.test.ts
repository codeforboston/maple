import { hasLegislators, LetterInput, renderLetter } from "./letter"

const base: LetterInput = {
  author: "Ada Example",
  replyTo: "ada@example.org",
  conference: "Data privacy conference committee",
  position: "passSenateVersion",
  content: "First thought.\n\nSecond thought.",
  representative: { name: "Rae Rep", district: "3rd Middlesex" },
  senator: { name: "Sam Sen", district: "Middlesex and Suffolk" }
}

describe("renderLetter", () => {
  it("addresses both legislators and copies the reader", () => {
    const l = renderLetter(base)
    expect(l.salutation).toBe(
      "Dear Representative Rae Rep and Senator Sam Sen,"
    )
    expect(l.from).toBe("Ada Example via MAPLE")
    expect(l.to).toBe("Rep. Rae Rep, Sen. Sam Sen")
    expect(l.replyTo).toBe("ada@example.org")
    expect(l.cc).toBe("ada@example.org")
    expect(l.subject).toBe(
      "Data privacy conference committee: Pass the Senate version"
    )
    expect(l.paragraphs).toEqual(["First thought.", "Second thought."])
    expect(l.signature).toEqual([
      "Ada Example",
      "House district: 3rd Middlesex",
      "Senate district: Middlesex and Suffolk",
      "ada@example.org"
    ])
  })

  it("writes to whichever legislator the reader has", () => {
    const l = renderLetter({ ...base, senator: undefined })
    expect(l.salutation).toBe("Dear Representative Rae Rep,")
    expect(l.to).toBe("Rep. Rae Rep")
    expect(l.signature).not.toContain("Senate district: Middlesex and Suffolk")
  })

  it("quotes what a cosign cosigns, with the reader's own line above it", () => {
    const l = renderLetter({
      ...base,
      cosign: { author: "Grace", content: "Pass it." }
    })
    expect(l.subject).toBe(
      "Data privacy conference committee: Cosigned input (Pass the Senate version)"
    )
    expect(l.paragraphs).toEqual(["First thought.", "Second thought."])
    expect(l.cosigned).toEqual({
      lead: "I cosigned this input by Grace on MAPLE:",
      quote: ["Pass it."]
    })
    expect(l.footer).toContain("this cosign is posted publicly")
  })

  it("has no own paragraphs on a cosign without a note", () => {
    const l = renderLetter({
      ...base,
      content: "",
      cosign: { author: "Grace", content: "Pass it." }
    })
    expect(l.paragraphs).toEqual([])
    expect(l.cosigned?.quote).toEqual(["Pass it."])
  })

  it("links the post once it has one", () => {
    expect(renderLetter(base).footer.endsWith("publicly.")).toBe(true)
    expect(
      renderLetter({ ...base, postUrl: "https://example.org/p" }).footer
    ).toContain("publicly: https://example.org/p")
  })
})

describe("hasLegislators", () => {
  it("needs a rep or a senator", () => {
    expect(hasLegislators(base)).toBe(true)
    expect(hasLegislators({ senator: base.senator })).toBe(true)
    expect(hasLegislators({})).toBe(false)
  })
})
