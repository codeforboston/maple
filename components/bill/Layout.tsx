import styled from "styled-components"
import { BillTestimonies } from "./BillTestimonies"
import { Col, Container, Row } from "../bootstrap"
import { Back } from "./Back"
import { BillNumber } from "./BillNumber"
import { SponsorsAndCommittees } from "./SponsorsAndCommittees"
import { Status } from "./Status"
import { Summary } from "./Summary"
import { BillProps } from "./types"

const StyledContainer = styled(Container)`
  font-family: "Nunito";
`

export const Layout = ({ bill }: BillProps) => {
  return (
    <StyledContainer className="mt-3">
      <Row>
        <Col>
          <Back href="/bills">Back to List of Bills</Back>
        </Col>
      </Row>
      <Row>
        <Col>
          <BillNumber bill={bill} />
        </Col>
        <Col xs={6} className="d-flex justify-content-end">
          <Status bill={bill} />
        </Col>
      </Row>
      {bill.content.Title}
      <Row className="mt-2">
        <Col>
          <Summary bill={bill} />
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <SponsorsAndCommittees bill={bill} />
          <BillTestimonies bill={bill.content} />
        </Col>
      </Row>
    </StyledContainer>
  )
}
