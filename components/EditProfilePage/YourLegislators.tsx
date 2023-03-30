import { Col, Row } from "../bootstrap"
import { External } from "../links"
import { StyledBody } from "../shared/TitledSectionCard"
import { SelectLegislators } from "../ProfilePage/SelectLegislators"

export const YourLegislators = () => {
  return (
    <>
      <Row className="mt-3 mb-3 gap-3">
        <Col xs={12} md={6} className="your-legislators-width">
          <SelectLegislators />
        </Col>
        <Col className="bg-secondary text-white rounded d-flex justify-content-center align-items-center pt-4 your-legislators-width">
          <p className="flex-grow-1">
            Please use the{" "}
            <External
              href="https://malegislature.gov/Search/FindMyLegislator"
              className={"text-white"}
            >
              {" "}
              find your legislator tool
            </External>{" "}
            and select your State Representative and Senator.
          </p>
        </Col>
      </Row>
    </>
  )
}
