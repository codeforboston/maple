import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
import { forwardRef, PropsWithChildren } from "react"
import { CurrentCommittee } from "../functions/src/bills/types"
import { Testimony } from "../functions/src/testimony/types"
import { BillContent, MemberContent } from "./db"
import { formatBillId } from "./formatting"

type LinkProps = PropsWithChildren<{ href: string; className?: string }>

export const Internal = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, children, className, ...rest }: LinkProps, ref) => {
    return (
      <Link href={href}>
        <a ref={ref} className={className} {...rest}>
          {children}
        </a>
      </Link>
    )
  }
)
Internal.displayName = "Internal"

export function External({
  href,
  children,
  className,
  plain,
  as: C = "a"
}: LinkProps & { plain?: boolean; as?: React.FC | "a" }) {
  return (
    <C href={href} target="_blank" rel="noreferrer" className={className}>
      {children} {!plain && <FontAwesomeIcon icon={faExternalLinkAlt} />}
    </C>
  )
}

export const Wrap: React.FC<{ href: string }> = ({ href, children }) => (
  <Link href={href} passHref>
    {children}
  </Link>
)

/**
 * Returns the full URL for the given path in the site.
 *
 * @example
 *
 * siteUrl('bill?id=H1000') === "https://digital-testimony-dev.web.app/bill?id=H1000"
 */
export function siteUrl(path?: string) {
  const base = typeof location === "undefined" ? "" : location.origin
  return path ? new URL(path, base).href : base
}

export function billURL(billNumber: string) {
  return `https://malegislature.gov/Bills/192/${billNumber}`
}

export function billLink(bill: BillContent) {
  return (
    <External href={billURL(bill.BillNumber)}>
      {formatBillId(bill.BillNumber)}
    </External>
  )
}

export function committeeURL(CommitteeCode: string) {
  return `https://malegislature.gov/Committees/Detail/${CommitteeCode}`
}

export function committeeLink(
  currentCommitteeContent: CurrentCommittee | undefined
) {
  if (currentCommitteeContent === undefined) {
    return <p>Bill not currently in committee</p>
  }

  const { id, name } = currentCommitteeContent
  return <External href={committeeURL(id)}>{name}</External>
}

export function memberURL(member: MemberContent) {
  return `https://malegislature.gov/Legislators/Profile/${member.MemberCode}`
}

export function memberLink(member: MemberContent) {
  return <External href={memberURL(member)}>{member.Name}</External>
}

export const getDirectTestimonyLink = (testimony: Testimony) => {
  const { billId, authorUid } = testimony

  return siteUrl(`testimony?billId=${billId}&author=${authorUid}`)
}

export const twitterShareLink = (publication: Testimony) => {
  const link = getDirectTestimonyLink(publication),
    billNumber = formatBillId(publication.billId),
    tweet = encodeURIComponent(
      `I provided testimony on Bill ${billNumber}. See ${link} for details.`
    ),
    tweetUrl = `https://twitter.com/intent/tweet?text=${tweet}`

  return tweetUrl
}
