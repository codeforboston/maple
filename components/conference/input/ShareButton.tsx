import { Button } from "components/bootstrap"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { Plus, SquareCheck } from "./icons"
import { brand } from "./tokens"

/* The site's primary button (MAPLE blue, styles/globals.css). && lifts these over Bootstrap's own .btn rules whatever order the
   stylesheets load in. */
const ShareCta = styled(Button)`
  && {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    /* At the top of its row (TitleShare in ConferenceDetails.tsx), which
       takes it and Follow 2px down together in the wide layout. */
    margin-top: 0;
    /* Set like the Follow button beside it (components/shared/FollowButton.tsx,
       styles/globals.css): 14px in the row's face, medium, a step bolder
       below 992px, 6px above and below (TitleShare in ConferenceDetails.tsx
       sets Follow's to match) and 16px a side. */
    padding: 0.375rem 1rem;
    font-size: 0.875rem;
    font-family: inherit;
    font-weight: 500;
    white-space: nowrap;
  }
  @media (max-width: 991.98px) {
    && {
      font-weight: 600;
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
 * floats it below md, while there is nothing filed and the panel is put
 * away). */
export function ShareFab({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation("conferences")
  return (
    <Fab type="button" onClick={onClick}>
      <Plus size={22} />
      {t("input.share")}
    </Fab>
  )
}

/** In its place once the reader has filed: "View your input", with a
 * checkbox, ticked. */
export function ViewFab({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation("conferences")
  return (
    <Fab type="button" onClick={onClick}>
      <SquareCheck size={20} />
      {t("input.view_yours")}
    </Fab>
  )
}
