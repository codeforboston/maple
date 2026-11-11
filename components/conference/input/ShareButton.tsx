import { Button } from "components/bootstrap"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { Plus } from "./icons"
import { brand } from "./tokens"

/* The site's primary button (MAPLE blue, styles/globals.css), set in Lexend.
   && lifts these over Bootstrap's own .btn rules whatever order the
   stylesheets load in. */
const ShareCta = styled(Button)`
  && {
    display: inline-flex;
    /* Its own size beside the title; the row's width on a line of its own
       (TitleRow in ConferenceDetails.tsx). */
    flex: 1 0 auto;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 3px;
    /* A size down from the site's primary button, as the mockup sets it. */
    padding: 8px 16px 8px 12px;
    font-size: 0.8125rem;
    font-family: var(--maple-font-heading);
    white-space: nowrap;
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

/** The way in, beside the title, or under it where the two do not fit. Drawn
 * disabled once the reader has filed. */
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
