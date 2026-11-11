/** A reader's conference input as the letter their rep and senator receive.
 * One renderer: the review step previews it and the daily sender mails it, so
 * what the reader approves is what is sent. Pure, so the website can import it. */

import type { ConferencePosition } from "../testimony/types"
export type { ConferencePosition }

const positionLabels: Record<ConferencePosition, string> = {
  passSomething: "Please pass something",
  passSenateVersion: "Pass the Senate version",
  passHouseVersion: "Pass the House version",
  passNothing: "Don't pass anything"
}

export type LetterMember = { name: string; district: string }

export type LetterInput = {
  /** The reader's name. */
  author: string
  /** Where replies go, and who is copied: the reader's own address, or the
   * one they chose for this letter. */
  replyTo: string
  conference: string
  position: ConferencePosition
  /** The reader's own words, empty on a cosign without a note. */
  content: string
  /** Set when the input cosigns another's. */
  cosign?: { author: string; content: string }
  representative?: LetterMember
  senator?: LetterMember
  /** The posted input's page, known once it is posted. */
  postUrl?: string
}

export type Letter = {
  from: string
  replyTo: string
  cc: string
  to: string
  subject: string
  salutation: string
  /** The reader's own words, a paragraph each. */
  paragraphs: string[]
  /** The cosigned input, quoted under a line saying so. */
  cosigned?: { lead: string; quote: string[] }
  signature: string[]
  footer: string
}

/** A letter has someone to go to once the reader has a rep or a senator. */
export const hasLegislators = (
  i: Pick<LetterInput, "representative" | "senator">
) => !!(i.representative || i.senator)

const paragraphsOf = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)

export function renderLetter(i: LetterInput): Letter {
  const label = positionLabels[i.position]
  const { representative: rep, senator: sen } = i
  const salutation = `Dear ${[
    rep && `Representative ${rep.name}`,
    sen && `Senator ${sen.name}`
  ]
    .filter(Boolean)
    .join(" and ")},`
  const signature = [
    i.author,
    ...(rep ? [`House district: ${rep.district}`] : []),
    ...(sen ? [`Senate district: ${sen.district}`] : []),
    i.replyTo
  ]
  const where = i.cosign ? "this cosign" : "this input"
  return {
    from: `${i.author} via MAPLE`,
    replyTo: i.replyTo,
    cc: i.replyTo,
    to: [rep && `Rep. ${rep.name}`, sen && `Sen. ${sen.name}`]
      .filter(Boolean)
      .join(", "),
    subject: i.cosign
      ? `${i.conference}: Cosigned input (${label})`
      : `${i.conference}: ${label}`,
    salutation,
    paragraphs: paragraphsOf(i.content),
    cosigned: i.cosign && {
      lead: `I cosigned this input by ${i.cosign.author} on MAPLE:`,
      quote: paragraphsOf(i.cosign.content)
    },
    signature,
    footer:
      `Position: ${label}. Sent by a constituent through MAPLE, where ${where} is posted publicly` +
      (i.postUrl ? `: ${i.postUrl}` : ".")
  }
}
