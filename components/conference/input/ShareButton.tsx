import { Button } from "components/bootstrap"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { LAYOUT_WIDE, RAIL_COMPACT } from "../styles"
import { Plus } from "./icons"
import { brand } from "./tokens"

/* The site's primary button (MAPLE blue, styles/globals.css), set in Lexend.
   && lifts these over Bootstrap's own .btn rules whatever order the
   stylesheets load in. */
const ShareCta = styled(Button)`
  && {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    /* At the top of the title's first line beside the 29.7px title, and
       2px down beside the 36px one in the wide layout (below). */
    margin-top: 0;
    /* 14px, 8px above and below and 24px a side (20px on the left, where
       the plus is). */
    padding: 0.5rem 1.5rem 0.5rem 1.25rem;
    font-size: 0.875rem;
    font-family: var(--maple-font-heading);
    white-space: nowrap;
  }
  /* Beside the compact rail (RAIL_COMPACT, styles.ts), narrower: 16px a
     side, 12px on the left, where the plus is. */
  @media ${RAIL_COMPACT} {
    && {
      padding-left: 0.75rem;
      padding-right: 1rem;
    }
  }
  /* In the wide layout (LAYOUT_WIDE, styles.ts), beside the 36px title: 2px
     down so its 39px is centred on the title's 43.2px first line. */
  @media ${LAYOUT_WIDE} {
    && {
      margin-top: 2px;
    }
  }
  /* Once the reader has filed: the paler fill, and still under the pointer,
     which Bootstrap's disabled .btn is not (pointer-events: none), so its
     title shows on hover. Its own fill rather than Bootstrap's fade on top. */
  &&:disabled {
    border-color: transparent;
    background: ${brand.fillDisabled};
    cursor: not-allowed;
    opacity: 1;
    pointer-events: auto;
  }
`

/** The way in, beside the title. Drawn disabled once the reader has filed. */
export function ShareButton({
  onClick,
  disabled
}: {
  onClick: () => void
  disabled?: boolean
}) {
  const { t } = useTranslation("conferences")
  return (
    <ShareCta
      variant="primary"
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? t("input.shared") : undefined}
    >
      <Plus size={16} />
      {t("input.share")}
    </ShareCta>
  )
}

/** The way in on mobile, floating at the bottom right as the mockup's was,
 * but always open: the plus and the words together, in MAPLE's blue, a
 * 52px pill, with a soft shadow so it reads over the page under it. Where
 * it floats is the caller's (FabDock in ConferenceDetails.tsx). */
const Fab = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 52px;
  padding: 0 26px 0 16px;
  border: 1px solid var(--maple-brand-primary);
  border-radius: 9999px;
  background: var(--maple-brand-primary);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  color: #ffffff;
  font-family: var(--maple-font-heading);
  font-size: 1rem;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 120ms ease, border-color 120ms ease;

  &:hover {
    background: var(--maple-brand-primary-strong);
    border-color: var(--maple-brand-primary-strong);
  }
  &:focus-visible {
    outline: 3px solid var(--maple-focus-ring);
    outline-offset: 3px;
  }
`

/** "Share your input" as a floating button, for mobile (ConferenceDetails.tsx
 * floats it below md, and only while there is nothing filed and the panel
 * is put away). */
export function ShareFab({
  onClick,
  className
}: {
  onClick: () => void
  className?: string
}) {
  const { t } = useTranslation("conferences")
  return (
    <Fab type="button" onClick={onClick} className={className}>
      <Plus size={22} />
      {t("input.share")}
    </Fab>
  )
}
