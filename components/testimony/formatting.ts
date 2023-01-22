import { Change, diffChars } from "diff"
import createDOMPurify from "dompurify"
import { cloneDeep } from "lodash"
import { marked, Tokenizer } from "marked"

export const splitParagraphs = (s: string) => s.split(/\s*[\r\n]+\s*/)

export const formatTestimony = (markdown: string) => {
  return new Formatter().parse(markdown)
}

export const formatTestimonyDiff = (
  currentMarkdown: string,
  previousMarkdown: string
) => {
  return new DiffFormatter().parse(currentMarkdown, previousMarkdown)
}

let plainTextFormatter: ReturnType<typeof createDOMPurify> | undefined
export const formatTestimonyPlaintext = (markdown: string) => {
  if (!plainTextFormatter) {
    plainTextFormatter = createDOMPurify()
    plainTextFormatter.setConfig({
      ALLOWED_TAGS: ["#text"],
      KEEP_CONTENT: true
    })
  }
  return plainTextFormatter.sanitize(formatTestimony(markdown).__html)
}

/** Converts markdown to renderable HTML. */
export class Formatter {
  parse = (markdown: string) => this.sanitize(marked.parse(markdown))
  lex = (markdown: string) => marked.lexer(markdown)

  // Be very conservative about the allowed formatting. Disable everything but
  // text styling and paragraphs.
  private disabledTokens: (keyof Tokenizer)[] = [
    "table",
    "list",
    "code",
    "fences",
    "heading",
    "hr",
    "blockquote",
    "lheading"
  ]
  private dom

  constructor() {
    marked.setOptions({
      ...marked.getDefaults(),
      // Github-flavored markdown
      gfm: true,
      // Single newline breaks
      breaks: true,
      // Convert ..., '', and "" to prettier unicode
      smartypants: true
    })
    marked.use({
      tokenizer: Object.fromEntries(
        this.disabledTokens.map(t => [t, (() => {}) as any])
      ),
      renderer: {
        // Escape html
        html: (html: string) => this.escapeHtml(html)
      }
    })
    this.dom = createDOMPurify()
    // Open all links in a new tab
    this.dom.addHook("afterSanitizeAttributes", function (node) {
      // set all elements owning target to target=_blank
      if ("target" in node) {
        node.setAttribute("target", "_blank")
        node.setAttribute("rel", "noopener")
      }
    })
  }

  private escapeHtml = (unsafe: string) => {
    return unsafe
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;")
  }

  protected sanitize = (raw: string) => ({
    __html: raw
  })
}

// TODO: Finish diffing
export class DiffFormatter {
  private formatter = new Formatter()

  parse = (currentMd: string, previousMd: string) => {
    const [curr, prev] = [currentMd, previousMd].map(md => {
      const tokens = this.formatter.lex(md)
      return { tokens, diffInput: this.getDiffInput(tokens) }
    })
    const charDiff = diffChars(curr.diffInput, prev.diffInput)
    const diffTokens = this.applyDiff(charDiff, curr.tokens, prev.tokens)

    return {
      charDiff,
      diffTokens,
      current: {
        html: this.formatter.parse(currentMd).__html,
        tokens: curr.tokens
      },
      previous: {
        html: this.formatter.parse(previousMd).__html,
        tokens: prev.tokens
      }
    }
  }

  /**
   * injects spans into the current tree to reflect the content diff.
   *
   * TODO: Walk the char diff and track the corresponding tokens in current and
   * previous. calculate the span of tokens that cover each diff, and build the
   * diff tokens by copying over current/previous tokens, wrapped in spans so
   * that the raw text cursor matches the location of spans in the formatted
   * output.
   */
  private applyDiff(
    charDiff: Change[],
    curr: marked.TokensList,
    prev: marked.TokensList
  ): marked.TokensList {
    let cursor = 0
    const visit = (t: marked.Token) => {
      if ("tokens" in t) t.tokens?.forEach(visit)
    }
    return cloneDeep(curr)
  }

  private getDiffInput = (tokens: marked.Token[]) =>
    tokens
      .map(t => {
        const tokenTypes = [t.type]
        if ("tokens" in t && t.tokens)
          marked.walkTokens(t.tokens, t => tokenTypes.push(t.type))
        return tokenTypes.join(" ")
      })
      .join("\n")
}
