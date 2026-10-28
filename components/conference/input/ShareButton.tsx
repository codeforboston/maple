import { Button } from "components/bootstrap"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { Plus } from "./icons"

/* The site's primary button (MAPLE blue under the Digital Democracy skins,
   styles/globals.css), set in Lexend. && lifts these over Bootstrap's own
   .btn rules whatever order the stylesheets load in. */
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
`

/** The way in, beside the title, or under it where the two do not fit. */
export function ShareButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation("conferences")
  return (
    <ShareCta variant="primary" type="button" onClick={onClick}>
      <Plus size={16} />
      {t("input.share")}
    </ShareCta>
  )
}
