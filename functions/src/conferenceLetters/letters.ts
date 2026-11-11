import { DateTime } from "luxon"
import { timeZone } from "../malegislature"
import { convertHtmlToText } from "../notifications/helpers"
import { Letter } from "./letter"

/** Yesterday, Eastern: the day whose new input the daily job mails. */
export function dayWindow(now: Date) {
  const end = DateTime.fromJSDate(now, { zone: timeZone }).startOf("day")
  return { start: end.minus({ days: 1 }), end }
}

/** Why a letter was not sent, kept so a skipped input is accounted for. */
export type SkipReason =
  | "withdrawn"
  | "superseded"
  | "noVerifiedEmail"
  | "noLegislator"
  | "noLegislatorEmail"
  | "noConference"
  | "noRecipients"

/** A display name made safe for a quoted From header: no line breaks, and
 * `"` and `\` escaped. */
export const quotedName = (name: string) =>
  name
    .replace(/[\r\n]+/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .trim()

export const letterFrom = (author: string, address: string) =>
  `"${quotedName(author) || "A MAPLE reader"} via MAPLE" <${address}>`

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

/** The letter as HTML, in the order the review step previews it. */
export const renderLetterHtml = (letter: Letter) => {
  const paragraphs = (ps: string[]) =>
    ps.map(p => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`).join("")
  return [
    `<p>${escapeHtml(letter.salutation)}</p>`,
    paragraphs(letter.paragraphs),
    letter.cosigned &&
      `<p><strong>${escapeHtml(letter.cosigned.lead)}</strong></p>` +
        `<blockquote>${paragraphs(letter.cosigned.quote)}</blockquote>`,
    `<p>${letter.signature.map(escapeHtml).join("<br>")}</p>`,
    `<p><small>${escapeHtml(letter.footer)}</small></p>`
  ]
    .filter(Boolean)
    .join("\n")
}

/** The `emails` document for a letter, for the send-email extension. Click and
 * open tracking are off per message: they would rewrite the links in a letter
 * to a legislator. */
export const buildLetterEmail = ({
  letter,
  author,
  fromAddress,
  to,
  subjectPrefix,
  createdAt
}: {
  letter: Letter
  author: string
  fromAddress: string
  to: string[]
  subjectPrefix: string
  createdAt: unknown
}) => {
  const html = renderLetterHtml(letter)
  return {
    to,
    cc: [letter.cc],
    from: letterFrom(author, fromAddress),
    replyTo: letter.replyTo,
    // The extension reads headers from the document, not from `message`.
    headers: {
      "X-SMTPAPI": JSON.stringify({
        category: ["constituent-letters"],
        filters: {
          opentrack: { settings: { enable: 0 } },
          clicktrack: { settings: { enable: 0 } }
        }
      })
    },
    message: {
      subject: subjectPrefix + letter.subject,
      text: convertHtmlToText(html),
      html
    },
    createdAt
  }
}
