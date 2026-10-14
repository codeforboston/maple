import { useTranslation } from "next-i18next"
import styled from "styled-components"
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

const RailRow = styled(Internal)<{ $on: boolean }>`
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
    color: ${({ $on }) =>
      $on ? "var(--maple-brand-primary)" : "var(--maple-text-strong)"};
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

/** One row of the list, shared with the phone picker. */
function RailEntry({ c, on }: { c: ConferenceSummary; on: boolean }) {
  const { t } = useTranslation("conferences")
  return (
    <RailRow
      href={maple.conference({ court: c.court, id: c.id })}
      aria-current={on ? "page" : undefined}
      $on={on}
    >
      <span className="name">{conferenceName(c)}</span>
      <span className="bills">
        {formatBillId(c.senateBillId)} · {formatBillId(c.houseBillId)}
        {c.status !== "appointed" && (
          <span className="status">{t(`status.${c.status}`)}</span>
        )}
      </span>
    </RailRow>
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
  className
}: {
  conferences: ConferenceSummary[]
  current: string
  className?: string
}) {
  const { t } = useTranslation("conferences")
  return (
    <Nav aria-label={t("in_conference")} className={className}>
      <RailList conferences={conferences} current={current} />
    </Nav>
  )
}

/** The rows, shared by the rail and the picker that stands in for it. */
export function RailList({
  conferences,
  current
}: {
  conferences: ConferenceSummary[]
  current: string
}) {
  return (
    <List>
      {conferences.map(c => (
        <li key={c.id}>
          <RailEntry c={c} on={c.id === current} />
        </li>
      ))}
    </List>
  )
}
