import { Col, Row } from "../bootstrap"
import { MemberSearchIndex, ProfileHook } from "../db"
import { External } from "../links"
import { SelectLegislators } from "../ProfilePage/SelectLegislators"
import { useTranslation } from "next-i18next"

export type YourLegislatorsProps = {
  index?: MemberSearchIndex
  profile?: ProfileHook
}

/** The pickers above the note, for Edit Profile's narrow right-hand column. */
export const YourLegislators = ({ index, profile }: YourLegislatorsProps) => {
  const { t } = useTranslation("editProfile")
  return (
    <>
      {/* Stacked in a card with a header band, no extra room above: the
          card's own padding is enough. */}
      <Row className="mb-3 gap-3">
        <Col xs={12} className="your-legislators-width">
          <SelectLegislators index={index} profile={profile} />
        </Col>
        {/* Plain body text under the pickers, with the tool as an ordinary
            link. */}
        <Col xs={12} className="your-legislators-width">
          <p className="mb-0">
            {t("legislator.politeWords")}
            <External href="https://malegislature.gov/Search/FindMyLegislator">
              {t("legislator.findTool")}
            </External>
            {t("legislator.findToolTip")}
          </p>
        </Col>
      </Row>
    </>
  )
}
