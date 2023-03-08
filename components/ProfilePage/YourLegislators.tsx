import { Col, Row } from "../bootstrap"
import { External } from "../links"
import { StyledBody } from "../shared/TitledSectionCard"
import { SelectLegislators } from "./SelectLegislators"

export const YourLegislators = () => {
  return (
    <StyledBody>
      <Row className="row-cols-2 m-0">
        <Col className="your-legislators-width">
          <div style={{ fontFamily: "Nunito", fontSize: "31px" }}>
            Your Legislators
          </div>
          <SelectLegislators />
        </Col>
        <Col className="bg-secondary text-white rounded d-flex justify-content-center align-items-center mt-4 pt-4 your-legislators-width">
          <p className="flex-grow-1 mx-3">
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
    </StyledBody>
  )
}
