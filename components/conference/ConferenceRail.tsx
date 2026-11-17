import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown } from "@fortawesome/free-solid-svg-icons"
import { isSitting } from "../../functions/src/shared"
import { formatBillId } from "../formatting"
import { Internal, maple } from "../links"
import { conferenceName, ConferenceSummary } from "./types"

const Nav = styled.nav`
  flex: 0 0 auto;
  width: clamp(168px, 19vw, 236px);
  position: sticky;
  top: 1rem;
  align-self: flex-start;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  padding: 1.625rem 0 3rem;
`

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const RailRow = styled(Internal)<{ $on: boolean; $covered: boolean }>`
  display: block;
  overflow: hidden;
  border-left: 3px solid
    ${({ $on }) => ($on ? "var(--maple-brand-primary)" : "transparent")};
  padding: 0.4375rem 0.5rem 0.4375rem 0.6875rem;
  border-radius: 0 var(--maple-radius-md) var(--maple-radius-md) 0;
  background: ${({ $on }) => ($on ? "var(--maple-surface-base)" : "none")};
  box-shadow: ${({ $on }) =>
    $on ? "inset 0 0 0 0.5px var(--maple-surface-border)" : "none"};
  text-decoration: none;
  transition: background-color 120ms ease;

  &:hover {
    background: ${({ $on }) =>
      $on ? "var(--maple-surface-base)" : "rgba(0, 0, 0, 0.05)"};
  }

  .name {
    display: block;
    font-size: 0.8125rem;
    line-height: 1.35;
    font-weight: ${({ $on }) => ($on ? 600 : 400)};
    color: ${({ $on, $covered }) =>
      $on
        ? "var(--maple-brand-primary)"
        : $covered
        ? "var(--maple-text-strong)"
        : "var(--maple-text-muted)"};
  }
  .bills {
    display: block;
    margin-top: 1px;
    font-size: 0.75rem;
    line-height: 1.35;
    color: var(--maple-text-muted);
  }
  .status {
    margin-left: 0.375rem;
    font-style: italic;
  }
`

/** The conferences no longer taking input, folded under the ones that are. */
const Closed = styled.details`
  margin-top: 0.75rem;

  > summary {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.4375rem 0.5rem 0.4375rem calc(0.6875rem + 3px);
    border-radius: 0 var(--maple-radius-md) var(--maple-radius-md) 0;
    font-size: 0.75rem;
    line-height: 1.35;
    color: var(--maple-text-muted);
    cursor: pointer;
    list-style: none;
    transition: background-color 120ms ease;

    &::-webkit-details-marker {
      display: none;
    }
    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    &:focus-visible {
      outline: 3px solid var(--maple-focus-ring);
      outline-offset: -3px;
    }
    .chevron {
      font-size: 0.625rem;
      transition: transform 150ms ease;
    }
  }
  &[open] > summary .chevron {
    transform: rotate(180deg);
  }
  > ul {
    margin-top: 2px;
  }
`

/** "S.1234 · H.5678", the status once the conference has finished, and a
 * label where we haven't covered it. The caller styles `.status`. */
export function BillLine({ c }: { c: ConferenceSummary }) {
  const { t } = useTranslation("conferences")
  return (
    <>
      {formatBillId(c.senateBillId)} · {formatBillId(c.houseBillId)}
      {c.status !== "appointed" && (
        <span className="status">{t(`status.${c.status}`)}</span>
      )}
      {!c.covered && <span className="status">{t("not_covered")}</span>}
    </>
  )
}

/**
 * Every conference, down the left, with the one being read marked by a bar.
 * In the flow rather than absolute: the column is the page's navigation
 * between conferences, so it stays where a reader found it.
 */
export function ConferenceRail({
  conferences,
  current,
  fold,
  className
}: {
  conferences: ConferenceSummary[]
  current: string
  fold: ClosedFold
  className?: string
}) {
  const { t } = useTranslation("conferences")
  return (
    <Nav aria-label={t("in_conference")} className={className}>
      <RailList conferences={conferences} current={current} fold={fold} />
    </Nav>
  )
}

/** Whether the group of conferences no longer taking input is open, and how
 * the reader opens or folds it. The page holds it, so the rail and the picker
 * share it and it lasts between conferences. */
export type ClosedFold = {
  open: boolean
  onToggle: (open: boolean) => void
}

/**
 * The rows, shared by the rail and the picker that stands in for it: the
 * conferences still sitting, then the rest in a group below them that the
 * reader opens and folds.
 */
export function RailList({
  conferences,
  current,
  fold
}: {
  conferences: ConferenceSummary[]
  current: string
  fold: ClosedFold
}) {
  const { t } = useTranslation("conferences")
  const sitting = conferences.filter(isSitting)
  const closed = conferences.filter(c => !isSitting(c))
  const rows = (cs: ConferenceSummary[]) => (
    <List>
      {cs.map(c => (
        <li key={c.id}>
          <Row c={c} on={c.id === current} />
        </li>
      ))}
    </List>
  )
  return (
    <>
      {rows(sitting)}
      {closed.length > 0 && (
        <Closed
          open={fold.open}
          onToggle={e => fold.onToggle(e.currentTarget.open)}
        >
          <summary>
            {t("rail_closed", { count: closed.length })}
            <FontAwesomeIcon className="chevron" icon={faChevronDown} />
          </summary>
          {rows(closed)}
        </Closed>
      )}
    </>
  )
}

function Row({ c, on }: { c: ConferenceSummary; on: boolean }) {
  return (
    <RailRow
      href={maple.conference(c)}
      scroll={false}
      aria-current={on ? "page" : undefined}
      $on={on}
      $covered={c.covered}
    >
      <span className="name">{conferenceName(c)}</span>
      <span className="bills">
        <BillLine c={c} />
      </span>
    </RailRow>
  )
}
