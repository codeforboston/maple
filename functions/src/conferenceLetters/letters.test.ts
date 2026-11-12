import { renderLetter } from "./letter"
import {
  buildLetterEmail,
  dayWindow,
  letterFrom,
  renderLetterHtml,
  renderLetterText
} from "./letters"

const letter = renderLetter({
  author: 'Ada "Ace" <Lovelace>',
  replyTo: "ada@example.org",
  conference: "Phone-Free Schools",
  position: "passSomething",
  content: "First.\n\nSecond & third.",
  representative: { name: "Pat Rep", district: "3rd Essex" },
  senator: { name: "Sam Sen", district: "1st Suffolk" }
})

describe("dayWindow", () => {
  it("is yesterday in Eastern time", () => {
    const { start, end } = dayWindow(new Date("2026-11-11T14:00:00Z"))
    expect(start.toISO()).toBe("2026-11-10T00:00:00.000-05:00")
    expect(end.toISO()).toBe("2026-11-11T00:00:00.000-05:00")
  })

  it("is a 25 hour day when the clocks go back", () => {
    const { start, end } = dayWindow(new Date("2026-11-02T14:00:00Z"))
    expect(end.diff(start, "hours").hours).toBe(25)
  })

  it("is a 23 hour day when the clocks go forward", () => {
    const { start, end } = dayWindow(new Date("2027-03-15T14:00:00Z"))
    expect(end.diff(start, "hours").hours).toBe(23)
  })
})

describe("letterFrom", () => {
  it("escapes quotes and backslashes and drops line breaks", () => {
    expect(letterFrom('A"B\\C\r\nD', "x@y.org")).toBe(
      '"A\\"B\\\\C D via MAPLE" <x@y.org>'
    )
  })

  it("names an author without a name", () => {
    expect(letterFrom("", "x@y.org")).toBe(
      '"A MAPLE reader via MAPLE" <x@y.org>'
    )
  })
})

describe("renderLetterHtml", () => {
  it("escapes the reader's words", () => {
    const html = renderLetterHtml(letter)
    expect(html).toContain("Second &amp; third.")
    expect(html).not.toContain("<Lovelace>")
  })
})

describe("renderLetterText", () => {
  it("keeps the paragraphs and signature lines apart", () => {
    expect(renderLetterText(letter)).toBe(
      [
        "Dear Representative Pat Rep and Senator Sam Sen,",
        "First.",
        "Second & third.",
        'Ada "Ace" <Lovelace>\nHouse district: 3rd Essex\nSenate district: 1st Suffolk\nada@example.org',
        letter.footer
      ].join("\n\n")
    )
  })

  it("quotes the cosigned input", () => {
    const cosigned = renderLetter({
      author: "Ada",
      replyTo: "ada@example.org",
      conference: "Phone-Free Schools",
      position: "passSomething",
      content: "Agreed.",
      cosign: { author: "Bo", content: "One.\n\nTwo." },
      representative: { name: "Pat Rep", district: "3rd Essex" }
    })
    expect(renderLetterText(cosigned)).toContain(
      "> I cosigned this input by Bo on MAPLE:\n>\n> One.\n>\n> Two."
    )
  })
})

describe("buildLetterEmail", () => {
  const email = buildLetterEmail({
    letter,
    author: "Ada",
    fromAddress: "notifications@mapletestimony.org",
    to: ["rep@malegislature.gov"],
    subjectPrefix: "[dev] ",
    createdAt: null
  })

  it("copies the reader and sends replies to them", () => {
    expect(email.cc).toEqual(["ada@example.org"])
    expect(email.replyTo).toBe("ada@example.org")
    expect(email.from).toBe(
      '"Ada via MAPLE" <notifications@mapletestimony.org>'
    )
    expect(email.to).toEqual(["rep@malegislature.gov"])
    expect(email.message.subject).toBe(
      "[dev] Phone-Free Schools: Please pass something"
    )
  })

  it("turns tracking off per message", () => {
    expect(JSON.parse(email.headers["X-SMTPAPI"])).toEqual({
      category: ["constituent-letters"],
      filters: {
        opentrack: { settings: { enable: 0 } },
        clicktrack: { settings: { enable: 0 } }
      }
    })
  })
})
