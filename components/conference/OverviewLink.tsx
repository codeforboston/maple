import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { maple } from "../links"
import { DottedInternal } from "./styles"

/** Placed in its heading's `link` grid area, at the right. */
const Link = styled(DottedInternal)`
  grid-area: link;
  justify-self: end;
  font-size: 0.875rem;
  white-space: nowrap;
`

/** The link to what a conference committee is, beside a page's heading. */
export function OverviewLink() {
  const { t } = useTranslation("conferences")
  return (
    <Link href={maple.conferences()}>{t("what_is_conference_committee")}</Link>
  )
}
