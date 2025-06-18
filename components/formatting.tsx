import { useMediaQuery } from "usehooks-ts"
import { Bill, BillContent } from "common/bills/types"
import { Timestamp } from "common/types"
import { Testimony } from "common/testimony/types"

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

const MISSING_TIMESTAMP = Timestamp.fromMillis(0)
export const formatTimestamp = (t?: Timestamp) => {
  if (!t || t.toMillis() == MISSING_TIMESTAMP.toMillis()) {
    return undefined
  }
  return t.toDate().toLocaleDateString()
}

export const FormattedBillTitle = ({ bill }: { bill: Bill | BillContent }) => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const billInfo = "content" in bill ? bill.content : bill

  const { BillNumber, Title } = billInfo

  return (
    <div className="mt-2">
      {formatBillId(BillNumber)}:{" "}
      {isMobile ? Title.substring(0, 45) + "..." : Title}
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

export const truncateText = (s: string | undefined, maxLength: number) =>
  !!s && s.length > maxLength ? s.substring(0, maxLength) + "..." : s
