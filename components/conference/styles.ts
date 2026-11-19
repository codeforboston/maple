import styled, { css } from "styled-components"
import { line } from "./input/tokens"
import { Internal } from "../links"
import { SlimBanner } from "../shared/StyledSharedComponents"

/** A committee page's maximum width from 992px (ConferenceDetails.tsx). */
export const COMMITTEE_PAGE_MAX = "1440px"

/** The round way back before a committee page's title on mobile
 * (ConferenceDetails.tsx): a 44px circle to tap, see-through, its icon in
 * the title's blue. */
export const mobileIcon = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: transparent;
  color: var(--maple-brand-primary-strong);

  &:hover {
    color: var(--maple-brand-primary);
  }
  &:focus-visible {
    outline: 2px solid var(--maple-focus-ring);
    outline-offset: 2px;
  }
`

/** Where a committee page's rail (ConferenceRail) comes in, at md: compact
 * at first (RAIL_COMPACT), at its full size from FULL_RAIL_FROM. Below it,
 * the rail is gone, and the way to the other conferences floats at the foot
 * (ConferenceDetails.tsx, ConferencePicker.tsx). */
export const RAIL_FROM = 768
export const RAIL_SHOWN = `(min-width: ${RAIL_FROM}px)`
export const RAIL_HIDDEN = `(max-width: ${RAIL_FROM - 0.02}px)`

/** Where the rail is at its full size: Bootstrap's xl. Below it the compact
 * rail leaves the page room for the committee card's one row
 * (CARD_WIDE_FROM). */
export const FULL_RAIL_FROM = 1200

/** The compact rail, between md and FULL_RAIL_FROM. */
export const RAIL_COMPACT = `(min-width: ${RAIL_FROM}px) and (max-width: ${
  FULL_RAIL_FROM - 0.02
}px)`

/** Where the input panel stands beside a committee page rather than over
 * it (input/Panel.tsx): lg. */
export const PANEL_BESIDE_FROM = 1024
/** The panel's width beside the page, the same at every window, so the page
 * beside it is the window less this. */
export const PANEL_W = 450
/** Below lg, where the panel is a sheet over the window, from md: laid out
 * as it is opened out to the window, its parts side by side, with no drawer
 * to fold it back to. On mobile, below md, its parts stack. */
export const SHEET_SPREAD = `(min-width: 768px) and (max-width: ${
  PANEL_BESIDE_FROM - 0.02
}px)`

/** Whether the panel stands beside the page, as the page's row says
 * (data-panel, ConferenceDetails.tsx), for rules that follow the page it
 * leaves rather than the window: an ancestor selector, `${BESIDE} &`. */
export const BESIDE = `[data-panel="beside"]`
export const NOT_BESIDE = `[data-panel="none"]`

/** With the panel beside the page (BESIDE), where the page it leaves is as
 * narrow as a window that brings the compact rail in, and narrower: the
 * compact rail is the page's last size before its mobile layout, which only
 * a narrow window brings. */
export const RAIL_COMPACT_BESIDE = `(min-width: ${PANEL_BESIDE_FROM}px) and (max-width: ${
  FULL_RAIL_FROM + PANEL_W - 0.02
}px)`

/** Where the list of conferences, opened from a button (ConferencePicker.tsx,
 * ConferenceHero.tsx), rises as a sheet from the screen's foot rather than
 * a popover over the button: below 576px, Bootstrap's sm, where the page
 * column's sides widen too (PageColumn). */
export const SHEET = "(max-width: 575.98px)"

/** A committee page's mobile layout, below md: the way back beside its
 * title, and the title fitted to one line across the row
 * (ConferenceDetails.tsx). From md, the title as on a wide screen, under the
 * way back's own row (BackToConferences.tsx). */
export const MOBILE_LAYOUT = "(max-width: 767.98px)"
export const FULL_LAYOUT = "(min-width: 768px)"

/** The committee page's wide layout, from Bootstrap's xl: the Share your
 * input button beside the 36px title (input/ShareButton.tsx). The committee
 * card has its own (CARD_WIDE). */
export const WIDE_FROM = 1200
export const LAYOUT_WIDE = `(min-width: ${WIDE_FROM}px)`
/** Where the committee card's grid goes to one row (ConferenceCommittee.tsx):
 * where, beside the compact rail, its block has about 708px (the page less
 * its 20px sides, the rail, the gap after it, and the card's border and
 * padding), enough for the names and the two maps in a row. With the panel
 * beside the page (BESIDE), where the page it leaves is that wide. */
export const CARD_WIDE_FROM = 1000
export const CARD_WIDE = `(min-width: ${CARD_WIDE_FROM}px)`
export const CARD_WIDE_BESIDE = `(min-width: ${CARD_WIDE_FROM + PANEL_W}px)`

/** The site's eyebrow, a size down: the mockup sets these at 11px. */
export const Eyebrow = styled.p.attrs((props): { className: string } => ({
  className: `maple-eyebrow m-0 ${props.className ?? ""}`
}))`
  font-family: var(--maple-font-body);
  font-size: 0.6875rem;
`

/** The page column's sides on a phone, below 576px (PageColumn), and how
 * far what runs out to the screen's edges reaches past them (the
 * conference page's pinned bands, ConferenceDetails.tsx; the hero's pinned
 * buttons, ConferenceHero.tsx). */
export const PHONE_GUTTER = "1.25rem"

/** The column shared by the conference page and the index: Bootstrap's xxl
 * container width (1320px), as the rest of the site's widest pages; was the
 * mockup's 1180. Its sides on a phone are PHONE_GUTTER, 2rem from 576px. */
export const PageColumn = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 ${PHONE_GUTTER} 3rem;

  @media (min-width: 576px) {
    padding-left: 2rem;
    padding-right: 2rem;
  }
`

/** The page heading, bold, in Lexend like the conference rail. */
export const Title = styled.h1`
  margin: 0;
  font-family: var(--maple-font-heading);
  font-weight: 700;
  font-size: 1.75rem;
  line-height: 1.2;
  color: var(--maple-brand-primary-strong);
  text-wrap: balance;

  @media (min-width: 700px) {
    font-size: 2.5rem;
  }
`

/** A white block with the page's card radius, as the committee card. */
export const Card = styled.section`
  background: var(--maple-surface-base);
  border: 1px solid var(--maple-surface-border);
  border-radius: var(--maple-radius-xl);
  padding: 1.5rem 2rem 2rem;

  @media (max-width: 575.98px) {
    padding: 1.25rem 1.25rem 1.5rem;
  }
`

/** A card on the conference committee page or the explorer, outlined in the
 * mockup's line rather than the site's lighter border, its text in Nunito.
 * Its title (CardTitle) and any empty state keep Lexend. */
export const CommitteeCard = styled(Card)`
  border-color: ${line.default};
  font-family: var(--maple-font-body);
`

/** Every section's title on the conference committee page, in a card or not. */
export const CardTitle = styled.h2`
  margin: 0 0 1.25rem;
  font-family: var(--maple-font-heading);
  font-weight: 500;
  font-size: 1.375rem;
  line-height: 1.3;
  color: var(--maple-text-strong);
`

/** The link style the mockup gives every link in the page body. */
export const DottedInternal = styled(Internal)`
  font-weight: 600;
  color: var(--maple-brand-primary);
  text-decoration: underline dotted;
  text-underline-offset: 3px;
  &:hover {
    color: var(--maple-brand-primary-strong);
  }
`

/** Party colours, which ring the portraits and fill the map. */
export const partyColor = (party: string) =>
  party === "Democrat"
    ? "#4682d5"
    : party === "Republican"
    ? "#b53333"
    : "#b5b4ae"

/** A line the page says about itself, such as a conference we don't cover,
 * or why a link could not do what it asked: the site's orange note
 * (SlimBanner), set in the page, edged all round and rounded rather than a
 * strip across it, and read from the left. */
export const Notice = styled(SlimBanner)`
  margin: 1rem 0 0;
  padding: 0.75rem 1rem;
  text-align: left;
  border: 1px solid color-mix(in srgb, var(--bs-orange) 45%, #ffffff);
  border-radius: var(--maple-radius-md);
`
