import Link from "next/link"
import { forwardRef, PropsWithChildren } from "react"
import { Bill, BillTopic, CurrentCommittee } from "common/bills/types"
import { MemberContent } from "./db"
import { formatBillId } from "./formatting"
import { TFunction } from "next-i18next"
import { Testimony } from "common/testimony/types"

type LinkProps = PropsWithChildren<{ href: string; className?: string }>

export const Internal = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, children, className, ...rest }: LinkProps, ref) => {
    return (
      <Link href={href} legacyBehavior>
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
}: LinkProps & {
  plain?: boolean
  as?: React.FC<React.PropsWithChildren<unknown>> | "a"
}) {
  return (
    <C href={href} target="_blank" rel="noreferrer" className={className}>
      {children}{" "}
      {
        !plain
        /*
         Icon removed from current Figma
         */
        // && <FontAwesomeIcon icon={faExternalLinkAlt} />
      }
    </C>
  )
}

export const Wrap: React.FC<React.PropsWithChildren<{ href: string }>> = ({
  href,
  children
}) => (
  <Link href={href} passHref legacyBehavior>
    {children}
  </Link>
)

/**
 * Returns the full URL for the given path in the site.
 *
 * @example
 *
 * siteUrl('bills/192/H1000') === "https://digital-testimony-dev.web.app/bills/192/H1000"
 */
export function siteUrl(path?: string) {
  const base = typeof location === "undefined" ? "" : location.origin
  return path ? new URL(path, base).href : base
}

export const maple = {
  home: () => "/",
  billSearch: () => `/bills`,
  bill: ({ court, id }: { court: number; id: string }) =>
    `/bills/${court}/${id}`,
  testimony: ({ publishedId }: { publishedId: string }) =>
    `/testimony/${publishedId}`,
  userTestimony: ({
    authorUid,
    billId,
    court
  }: {
    authorUid: string
    billId: string
    court: number
  }) => `/testimony/${authorUid}/${court}/${billId}`
}

export function billSiteURL(billNumber: string, court: number) {
  return maple.bill({ court: court, id: billNumber })
}

/** Not all bills have pdf's, only those without document text */
export function billPdfUrl(court: number, id: string) {
  return `https://malegislature.gov/Bills/${court}/${id}.pdf`
}

export function externalBillLink(bill: Bill) {
  const url = `https://malegislature.gov/Bills/${bill.court}/${bill.id}`
  return <External href={url}>{formatBillId(bill.id)}</External>
}

export function committeeURL(CommitteeCode: string) {
  return `https://malegislature.gov/Committees/Detail/${CommitteeCode}`
}

export function committeeLink(
  currentCommitteeContent: CurrentCommittee | undefined,
  t: TFunction
) {
  if (currentCommitteeContent === undefined) {
    return <p>{t("notInCommittee")}</p>
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

export const twitterShareLink = (publication: Testimony, t: TFunction) => {
  const link = siteUrl(maple.testimony({ publishedId: publication.id })),
    billNumber = formatBillId(publication.billId),
    tweet = encodeURIComponent(t("link.tweetContent", { billNumber, link })),
    tweetUrl = `https://twitter.com/intent/tweet?text=${tweet}`

  return tweetUrl
}

export const billSearchByTopicLink = (court: number, topic: BillTopic) => {
  const params = {
    "bills/sort/latestTestimonyAt:desc[multiselectHierarchicalMenu][topics.lvl1][0]": `${topic.category} > ${topic.topic}`,
    "bills/sort/latestTestimonyAt:desc[refinementList][court][0]": `${court}`
  }
  return `/bills?${new URLSearchParams(params).toString()}`
}
