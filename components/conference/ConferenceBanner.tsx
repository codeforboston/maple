import { Trans, useTranslation } from "next-i18next"
import styled from "styled-components"
import { Internal, maple } from "../links"
import { PageBanner } from "../shared/PageBanner"
import { ConferenceSummary, conferenceName } from "./types"

const Link = styled(Internal)`
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
  &:hover {
    color: inherit;
  }
`

/**
 * Over a bill that is in conference, pointing at the committee. Both the
 * Senate and the House bill get it: once a bill is in conference the committee
 * is the unit of interest, and the bill page is where people arrive.
 */
export function ConferenceBanner({
  conference
}: {
  conference: ConferenceSummary | null | undefined
}) {
  const { t } = useTranslation("conferences")
  if (!conference) return null
  const message = (
    <Trans
      t={t}
      i18nKey={`bill_banner.${conference.status}`}
      values={{ name: conferenceName(conference) }}
      components={{
        1: <Link href={maple.conference(conference)} />
      }}
    />
  )
  // Maple keeps main's orange banner; the other skins get the slim note
  // (PageBanner). Worded by the conference's status, as on main.
  return <PageBanner>{message}</PageBanner>
}
