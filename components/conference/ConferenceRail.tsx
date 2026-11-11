import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { formatBillId } from "../formatting"
import { Internal, maple } from "../links"
import { conferenceName, ConferenceSummary } from "./types"

/** In Lexend, the conference names and bill numbers alike. Pinned at the
 * navbar's edge, as the title is (ConferenceDetails.tsx, TitleBand), and with
 * the title's 1.625rem above its first row, so the two start level. */
const Nav = styled.nav`
  font-family: var(--maple-font-heading);
  flex: 0 0 auto;
  width: clamp(200px, 22vw, 288px);
  position: sticky;
  top: var(--maple-navbar-height);
  align-self: flex-start;
  max-height: calc(100vh - var(--maple-navbar-height));
  overflow-y: auto;
  padding: 1.625rem 0 3rem;
`

/** The light line both the rules between the rows and the selected row's
 * outline are drawn in: a whole pixel of the site's border colour
 * (rgba(15, 23, 42, 0.12)) at half its strength. A half-pixel line looks the
 * same but drops out where the rail's edge falls between pixels. */
const RULE = "rgba(15, 23, 42, 0.06)"

/** The rows with a light rule between each. */
const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;

  li + li {
    border-top: 1px solid ${RULE};
  }
`

/** `$filed`: the committee has filed its report, so its row is dimmed as a
 * whole, unless it is the one being read. `$covered`: false where we haven't
 * covered it, so its name is muted. */
const RailRow = styled(Internal)<{
  $on: boolean
  $filed: boolean
  $covered: boolean
}>`
  display: block;
  overflow: hidden;
  border-left: 3px solid
    ${({ $on }) => ($on ? "var(--maple-brand-primary)" : "transparent")};
  padding: 0.75rem 0.75rem 0.75rem 1rem;
  border-radius: 0 var(--maple-radius-md) var(--maple-radius-md) 0;
  background: ${({ $on }) => ($on ? "var(--maple-surface-base)" : "none")};
  box-shadow: ${({ $on }) => ($on ? `inset 0 0 0 1px ${RULE}` : "none")};
  text-decoration: none;
  transition: background-color 120ms ease;
  opacity: ${({ $on, $filed }) => ($filed && !$on ? 0.5 : 1)};

  &:hover {
    background: ${({ $on }) =>
      $on ? "var(--maple-surface-base)" : "rgba(0, 0, 0, 0.05)"};
  }

  .name {
    display: block;
    font-size: 0.9375rem;
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
    font-size: 0.8125rem;
    line-height: 1.35;
    color: var(--maple-text-muted);
  }
  .status {
    margin-left: 0.375rem;
    font-style: italic;
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
          <RailRow
            href={maple.conference(c)}
            scroll={false}
            aria-current={c.id === current ? "page" : undefined}
            $on={c.id === current}
            $filed={c.status === "reportFiled"}
            $covered={c.covered}
          >
            <span className="name">{conferenceName(c)}</span>
            <span className="bills">
              <BillLine c={c} />
            </span>
          </RailRow>
        </li>
      ))}
    </List>
  )
}
