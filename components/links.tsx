import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
import { PropsWithChildren } from "react"
import { CurrentCommittee } from "../functions/src/bills/types"
import { BillContent, MemberContent } from "./db"
import { formatBillId } from "./formatting"

type LinkProps = PropsWithChildren<{ href: string; className?: string }>

export function Internal({ href, children, className }: LinkProps) {
  return (
    <Link href={href}>
      <a className={className}>{children}</a>
    </Link>
  )
}

export function External({
  href,
  children,
  className,
  plain
}: LinkProps & { plain?: boolean }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children} {!plain && <FontAwesomeIcon icon={faExternalLinkAlt} />}
    </a>
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
