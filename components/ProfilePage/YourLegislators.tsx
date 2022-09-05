import { Col, Row } from "../bootstrap"
import { External } from "../links"
import { StyledBody } from "../shared/TitledSectionCard"
import { SelectLegislators } from "./SelectLegislators"

export const YourLegislators = () => {
  return (
    <StyledBody>
      <Row className="row-cols-2 my-3 border">
        <Col>
          <SelectLegislators />
        </Col>
        <Col className="bg-secondary text-white rounded d-flex justify-content-center align-items-center">
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
