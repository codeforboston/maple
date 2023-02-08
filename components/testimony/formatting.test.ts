import { dump } from "js-yaml"
import { formatTestimony, formatTestimonyDiff } from "./formatting"
const curr = `
Testimony Version 2

1. List **should** be ~~__converted__~~ to \`parag<a/>raph\`
2. Same parag<a></asdf>raph

![image][./image.png]

<div>This should be <a>a normal</a> paragraph too</div>

Ending Paragraph.
`

const prev = `
Testimony Version 1

New Paragraph

1. List should be converted to paragraph

Ending Paragraph.
`

describe("formatTestimonyDiff", () => {
  test("diff", () => {
    const { current, charDiff } = formatTestimonyDiff(curr, prev)

    expect(dump(current.tokens, {})).toMatchSnapshot()
    expect(dump(charDiff, {})).toMatchSnapshot()
    expect(current.html).toMatchSnapshot()
  })
})

describe("formatTestimony", () => {
  test.each<{
    testCase: string
    md: string
    html?: string
    check?: (html: string) => void
  }>([
    {
      testCase: "empty",
      md: "",
      html: ``
    },
    {
      testCase: "paragraph",
      md: "Testimony",
      html: `<p>Testimony</p>\n`
    },
    {
      testCase: "line breaks",
      md: "Testimony\nTestimony",
      html: `<p>Testimony<br>Testimony</p>\n`
    },
    {
      testCase: "multiple paragraphs",
      md: `Paragraph 1

Paragraph 2`,
      html: `<p>Paragraph 1</p>\n<p>Paragraph 2</p>\n`
    },
    {
      testCase: "text styling",
      md: "**_nested_** _italics_ **bold** ~~strikethrough~~ `inline literal`",
      html: `<p><strong><em>nested</em></strong> <em>italics</em> <strong>bold</strong> <del>strikethrough</del> <code>inline literal</code></p>\n`
    },
    {
      testCase: "escapes html",
      md: `<div></div>`,
      html: `&lt;div&gt;&lt;/div&gt;`
    },
    {
      testCase: "ignores lists",
      md: `1. item 1
2. item 2`,
      html: `<p>1. item 1<br>2. item 2</p>\n`
    },
    {
      testCase: "ignores tables",
      md: `
| a | b |
|---|---|
| 1 | 2 |
      `,
      check: (html: string) => expect(html).not.toMatch(/table/i)
    },
    {
      testCase: "ignores code",
      md: ["```\nfences\n```", "    code block"].join("\n\n"),
      check: (html: string) => {
        expect(html).not.toMatch(/pre.*code/)
      }
    },
    {
      testCase: "ignores sections",
      md: `
# h1

> block quote

---

lheading 1
==========

lheading 2
----------

      `,
      html: `<p># h1</p>
<p>&gt; block quote</p>
<p>—</p>
<p>lheading 1<br>==========</p>
<p>lheading 2</p>
<p>———-</p>
`
    }
  ])(
    "$testCase",
    ({
      html: expectedHtml,
      md,
      check = actual => expect(actual).toEqual(expectedHtml)
    }) => {
      const actual = formatTestimony(md).__html
      check(actual)
    }
  )
})
