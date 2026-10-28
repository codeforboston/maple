import { Col, Row } from "../bootstrap"
import { MemberSearchIndex, ProfileHook } from "../db"
import { External } from "../links"
import { SelectLegislators } from "../ProfilePage/SelectLegislators"
import { useTranslation } from "next-i18next"
import { useHtmlAttribute } from "components/shared/useHtmlAttribute"

export type YourLegislatorsProps = {
  index?: MemberSearchIndex
  profile?: ProfileHook
  /** The pickers above the note rather than beside it, for a narrow column
   * (Edit Profile's right-hand column under the Digital Democracy skins). */
  stacked?: boolean
}

export const YourLegislators = ({
  index,
  profile,
  stacked = false
}: YourLegislatorsProps) => {
  const { t } = useTranslation("editProfile")
  // Digital Democracy, Mixed and Statehouse: the search menus open over the
  // page, since the card around them clips anything that overflows it.
  const dd = useHtmlAttribute("data-maple-theme") === "dd"
  return (
    <>
      {/* Stacked in a card with a header band, no extra room above: the
          card's own padding is enough. */}
      <Row className={stacked ? "mb-3 gap-3" : "mt-3 mb-3 gap-3"}>
        <Col xs={12} md={stacked ? 12 : 6} className="your-legislators-width">
          <SelectLegislators
            index={index}
            profile={profile}
            portalMenu={dd}
            selectWording={dd}
            headingLabels={dd}
          />
        </Col>
        {/* Maple: main's white text on a blue box. Digital Democracy, Mixed
            and Statehouse: plain body text under the pickers, with the tool as
            an ordinary link. */}
        <Col
          xs={stacked ? 12 : undefined}
          className={
            dd
              ? "your-legislators-width"
              : "bg-secondary text-white rounded d-flex justify-content-center align-items-center pt-4 your-legislators-width"
          }
        >
          <p className={dd ? "mb-0" : "flex-grow-1"}>
            {t("legislator.politeWords")}
            <External
              href="https://malegislature.gov/Search/FindMyLegislator"
              className={dd ? undefined : "text-white"}
            >
              {t("legislator.findTool")}
            </External>
            {t("legislator.findToolTip")}
          </p>
        </Col>
      </Row>
    </>
  )
}
