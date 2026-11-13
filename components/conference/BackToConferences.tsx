import { faChevronLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { maple } from "../links"
import { Back } from "../shared/CommonComponents"
import { MOBILE_LAYOUT, RAIL_COMPACT } from "./styles"

/** Its own row under the navbar, across the full width, 2rem in from the
 * window's edges (1.25rem on a phone), outside the page's column. */
const Row = styled.div<{
  $notMobile: boolean
  $committee: boolean
  $divider: boolean
}>`
  /* Its sides, which the divider keeps within. */
  --side: 1.25rem;
  padding: 0.75rem var(--side);

  @media (min-width: 576px) {
    --side: 2rem;
  }

  /* With divider, a faint line under it, within its sides, as the rail's
     own rules (ConferenceRail.tsx), between the way back and the page:
     22px under the way back, a touch less than the page's 1.625rem under it
     (ConferenceDetails.tsx). */
  ${({ $divider }) =>
    $divider
      ? `position: relative;
        padding-bottom: 1.375rem;
        &::after {
          content: "";
          position: absolute;
          left: var(--side);
          right: var(--side);
          bottom: 0;
          border-top: 1px solid rgba(15, 23, 42, 0.08);
        }`
      : ""}

  /* With notMobile, not in a committee page's mobile layout, where a
     chevron beside the title is the way back (ConferenceDetails.tsx). */
  ${({ $notMobile }) =>
    $notMobile ? `@media ${MOBILE_LAYOUT} { display: none; }` : ""}

  /* With committee, in line with a committee's page beside its compact
     rail, 20px in rather than 2rem (ConferenceDetails.tsx). */
  ${({ $committee }) =>
    $committee ? `@media ${RAIL_COMPACT} { --side: 1.25rem; }` : ""}
`

/** The way back, as the site's other back links (Back, as the bill page's
 * "back to list of bills"): a chevron, then the words underlined, not the
 * chevron. */
const Link = styled(Back)`
  && {
    text-decoration: none;
  }
  /* A finger's worth to tap, 44px tall, for the one line it takes on the
     page: 10px more above and below to press, given back in the margins so
     nothing around it moves. */
  display: inline-block;
  padding: 10px 0;
  margin: -10px 0;
  .words {
    text-decoration: underline;
    text-underline-offset: 0.16em;
  }
`

/**
 * "Back to Conference Home": the way back to the Conference Committees page
 * from the explorer and each committee's page, in a row of its own above
 * the page.
 */
export function BackToConferences({
  notMobile = false,
  committee = false,
  divider = false
}: {
  /** Not in a committee page's mobile layout (MOBILE_LAYOUT, styles.ts). */
  notMobile?: boolean
  /** Over a committee's page, in line with its sides (RAIL_COMPACT). */
  committee?: boolean
  /** A faint line under it, across the window. */
  divider?: boolean
}) {
  const { t } = useTranslation("conferences")
  return (
    <Row $notMobile={notMobile} $committee={committee} $divider={divider}>
      <Link href={maple.conferences()}>
        <FontAwesomeIcon
          icon={faChevronLeft}
          aria-hidden
          style={{ fontSize: "0.9em", marginRight: "0.4em" }}
        />
        <span className="words">{t("back_to_home")}</span>
      </Link>
    </Row>
  )
}
