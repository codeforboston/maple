/**
 * Normalize summary outputs from the LLM.
 *
 * The summary prompt has some formatting prose that we don't want to persist
 * into the database. For example, it prefixes every summary with `Summary:`.
 * We apply a few preprocessing steps to every summary to keep things uniform:
 *
 * 1. Remove leading `Summary:` from the input text
 * 2. Split any newlines created by unordered lists in the input text
 * 3. Remove leading `- ` from the split unordered lists
 * 4. Remove any remaining whitespace
 * 5. Put everything back together separated with spaces
 */

// The line boundaries Python's `str.splitlines` recognizes, which the original
// implementation used.
const LINE_BREAK = /\r\n|[\n\r\v\f\x1c\x1d\x1e\x85\u2028\u2029]/

export const normalizeSummary = (summary: string): string =>
  summary
    .replace(/^Summary:/, "")
    .split(LINE_BREAK)
    .map(line => line.replace(/^- /, "").trim())
    .filter(line => line !== "")
    .join(" ")
