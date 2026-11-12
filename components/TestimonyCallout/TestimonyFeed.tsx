import { Trans, useTranslation } from "next-i18next"
import { Fragment } from "react"
import styled from "styled-components"
import { Testimony } from "../db"
import { formatBillId } from "../formatting"
import * as links from "../links"
import { trimContent, VoteHand } from "./TestimonyCallout"

/** Each position's colour for the mark behind the white hand drawing: the
 * bubbles' colours, the site's green, blue and orange at 90% over white. */
const MARKS: Record<Testimony["position"], string> = {
  endorse: "#50a338",
  neutral: "#314691",
  oppose: "#ff9219"
}

/** A row's testimony. `alsoOn` lists more bills to show after the first, as
 * "S.3184 & H.4767", for trying out a row about more than one bill. TEST
 * ONLY: `href` is where the row links, in place of the testimony's own
 * page, for test rows copied from testimony elsewhere. */
export type FeedTestimony = Testimony & { alsoOn?: string[]; href?: string }

/**
 * Recent testimony as a feed: a row each, on white with thin rules between,
 * in a panel narrower than the section. Each row has MAPLE's hand drawing in
 * a circle of the position's colour, then, for the "bill" variant, the bill's
 * title, wrapping onto more lines where it runs long, and its bill numbers on
 * the right; or, for the "quote" variant, in the bubbles' order, the quote,
 * up to 150 characters, and "- Author on H.5004".
 *
 * The whole row links to the testimony, or for input on a conference committee,
 * to the conference's page, in a new tab; each underlined bill number links
 * to its bill, in this one. Links can't hold links, so the row's link is the
 * title or the quote, stretched over the row (.stretched), with the bill
 * numbers above it.
 */
const Feed = styled.div`
  background: var(--maple-surface-base);
  border: 1px solid var(--maple-surface-border);
  border-radius: var(--maple-radius-md);
  margin: 0 auto;
  max-width: 48rem;
  padding: 0 1.5rem;

  /* With columns={2}: above 768px, the rows as separate cards across the
     whole column, one to a row, then two by two from lg. Up to 768px, the
     rows in the panel. */
  @media (min-width: 769px) {
    &.two-up {
      background: none;
      border: none;
      border-radius: 0;
      display: grid;
      gap: 1.5rem;
      grid-template-columns: 1fr;
      max-width: none;
      padding: 0;
    }
  }

  @media (min-width: 992px) {
    &.two-up {
      grid-template-columns: 1fr 1fr;
    }
  }
`

const Item = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 0;
  border-bottom: 1px solid var(--maple-surface-border);
  color: var(--maple-text-body);

  &:last-child {
    border-bottom: none;
  }

  /* A card, in the feed as cards (Feed, .two-up). */
  @media (min-width: 769px) {
    .two-up > & {
      background: var(--maple-surface-base);
      border: 1px solid var(--maple-surface-border);
      border-radius: var(--maple-radius-md);
      padding: 1.25rem 1.5rem;
    }

    /* On its own, across both columns. */
    .two-up > &:only-child {
      grid-column: 1 / -1;
    }
  }

  /* The quote rows, with the circle at the top of the quote. */
  &.quote-item {
    align-items: flex-start;
  }

  /* The row's link to the testimony, covering the whole row. */
  .stretched {
    color: inherit;
    text-decoration: none;
  }

  .stretched::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: var(--maple-radius-sm);
  }

  .stretched:focus-visible {
    outline: none;
  }

  .stretched:focus-visible::after {
    box-shadow: 0 0 0 0.25rem var(--maple-focus-ring);
  }

  /* The hand drawing, white line art, in a circle of the position's
     colour. */
  .mark {
    border-radius: 50%;
    flex: 0 0 auto;
    height: 2.75rem;
    padding: 0.2rem;
    width: 2.75rem;
  }

  /* The bill rows: the title in Nunito, taking the room the bill numbers
     leave it and wrapping within it, then the bill numbers at the right, on
     one line. */
  .title,
  .bills {
    color: var(--maple-text-strong);
    font-family: var(--maple-font-body);
    font-size: 1rem;
    line-height: 1.5;
  }

  .title {
    flex: 1;
    min-width: 0;
  }

  .bills {
    flex: 0 0 auto;
    white-space: nowrap;
  }

  /* As in the bubbles' bylines: the bill number underlined, in Lexend.
     Above the row's link, so it opens the bill. */
  .bill {
    color: inherit;
    font-family: var(--maple-font-heading);
    font-weight: 500;
    position: relative;
    text-decoration: underline;
    text-underline-offset: 0.15em;
    z-index: 1;
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-width: 0;
  }

  /* The quote, up to 150 characters (trimContent), in Lexend as in the
     bubbles. */
  .quote {
    color: var(--maple-text-strong);
    font-family: var(--maple-font-heading);
    font-size: 1rem;
    line-height: 1.5;
  }

  /* As in the bubbles: in Nunito, the bill number in Lexend (.bill). */
  .byline {
    font-family: var(--maple-font-body);
    font-size: 0.9rem;
    font-weight: 500;
  }
`

type Variant = "bill" | "quote"

/** A bill number, underlined, linking to its bill. */
const BillLink = ({ id, court }: { id: string; court: number }) => (
  <links.Internal className="bill" href={links.maple.bill({ id, court })}>
    {formatBillId(id)}
  </links.Internal>
)

/** The row's bill numbers, each its own link, as "S.3184 & H.4767". */
const BillLinks = ({ ids, court }: { ids: string[]; court: number }) => {
  const { t } = useTranslation("testimony")

  return (
    <>
      {ids.map((id, i) => (
        <Fragment key={id}>
          {i > 0 && t("testimonyFeed.billSeparator")}
          <BillLink id={id} court={court} />
        </Fragment>
      ))}
    </>
  )
}

const FeedItem = ({
  variant,
  id,
  conferenceId,
  billId,
  alsoOn = [],
  href,
  billTitle,
  court,
  position,
  content,
  authorDisplayName
}: FeedTestimony & { variant: Variant }) => {
  const { t } = useTranslation("testimony")
  const testimonyHref =
    href ??
    (conferenceId
      ? links.maple.conference({ court, id: conferenceId })
      : links.maple.testimony({ publishedId: id }))

  return (
    <Item className={variant === "quote" ? "quote-item" : undefined}>
      <span className="mark" style={{ background: MARKS[position] }}>
        <VoteHand position={position} />
      </span>
      {variant === "quote" ? (
        <span className="body">
          <a
            className="quote stretched"
            href={testimonyHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            “{trimContent(content, 150)}”
          </a>
          <span className="byline">
            <Trans
              t={t}
              i18nKey="testimonyCallout.byline"
              values={{ author: authorDisplayName, bill: formatBillId(billId) }}
              components={{
                1: <BillLinks ids={[billId, ...alsoOn]} court={court} />
              }}
            />
          </span>
        </span>
      ) : (
        <>
          <a
            className="title stretched"
            href={testimonyHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            {billTitle}
          </a>
          <span className="bills">
            <BillLinks ids={[billId, ...alsoOn]} court={court} />
          </span>
        </>
      )}
    </Item>
  )
}

export default function TestimonyFeed({
  testimony,
  variant = "bill",
  columns = 1
}: {
  testimony: FeedTestimony[]
  variant?: Variant
  columns?: 1 | 2
}) {
  return (
    <Feed className={columns === 2 ? "two-up" : undefined}>
      {testimony.map(item => (
        <FeedItem
          key={item.authorUid + item.billId}
          variant={variant}
          {...item}
        />
      ))}
    </Feed>
  )
}
