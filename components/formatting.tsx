import Autolinker from "autolinker"
import createDOMPurify, { DOMPurifyI } from "dompurify"
import { Timestamp } from "firebase/firestore"
import { Testimony } from "../functions/src/testimony/types"
import { Bill, BillContent } from "./db"

const sanitize = (() => {
  let dom: DOMPurifyI | undefined
  return (raw: string) => {
    if (!dom) {
      dom = createDOMPurify()
      dom.addHook("afterSanitizeAttributes", function (node) {
        // set all elements owning target to target=_blank
        if ("target" in node) {
          node.setAttribute("target", "_blank")
          node.setAttribute("rel", "noopener")
        }
      })
    }
    return dom.sanitize(raw, {
      USE_PROFILES: { html: true }
    })
  }
})()

const billIdFormat = /^(?<chamber>\D+)(?<number>\d+)$/

/** Formats H123 as H.123 */
export const formatBillId = (id: string) => {
  const match = billIdFormat.exec(id)
  if (!match?.groups) {
    return id
  } else {
    return `${match.groups.chamber}.${match.groups.number}`
  }
}

export const formatTestimonyLinks = (testimony: string, limit?: number) => {
  const linkedTestimony = Autolinker.link(
    limit ? testimony.slice(0, limit) : testimony,
    {
      truncate: 32
    }
  )

  const paragraphedTestimony = linkedTestimony
    .split(/\s*[\r\n]+\s*/)
    .map(line => `<p>${line}</p>`)
    .join("")

  return sanitize(paragraphedTestimony)
}

const MISSING_TIMESTAMP = Timestamp.fromMillis(0)
export const formatTimestamp = (t?: Timestamp) => {
  if (!t || t.toMillis() == MISSING_TIMESTAMP.toMillis()) {
    return undefined
  }
  return t.toDate().toLocaleDateString()
}

export const FormattedBillTitle = ({ bill }: { bill: Bill | BillContent }) => {
  const billInfo = "content" in bill ? bill.content : bill

  const { BillNumber, Title } = billInfo

  return (
    <div className="mt-2">
      {formatBillId(BillNumber)}: {Title}
    </div>
  )
}

export const FormattedTestimonyTitle = ({
  testimony
}: {
  testimony: Testimony
}) => {
  const { authorDisplayName, publishedAt, position } = testimony

  return (
    <div>
      <span>
        <b>Author:</b> {authorDisplayName || "anonymous"}
      </span>
      <br></br>
      <span>
        <b>Published on:</b> {publishedAt.toDate().toLocaleDateString()}
      </span>
      <br></br>
      <span>
        <b>Position:</b> {position}
      </span>
    </div>
  )
}

export const decodeHtmlCharCodes = (s: string) =>
  s.replace(/(&#(\d+);)/g, (match, capture, charCode) =>
    String.fromCharCode(charCode)
  )
