import { Col, Row } from "../bootstrap"
import { External } from "../links"
import { SelectLegislators } from "../ProfilePage/SelectLegislators"
import { useTranslation } from "next-i18next"

export const YourLegislators = () => {
  const { t } = useTranslation("editProfile")
  return (
    <>
      <Row className="mt-3 mb-3 gap-3">
        <Col xs={12} md={6} className="your-legislators-width">
          <SelectLegislators />
        </Col>
        <Col className="bg-secondary text-white rounded d-flex justify-content-center align-items-center pt-4 your-legislators-width">
          <p className="flex-grow-1">
            {t("legislator.politeWords")}
            <External
              href="https://malegislature.gov/Search/FindMyLegislator"
              className={"text-white"}
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
