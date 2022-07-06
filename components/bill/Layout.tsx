import styled from "styled-components"
import { BillTestimonies } from "./BillTestimonies"
import { Col, Container, Row } from "../bootstrap"
import { Back } from "./Back"
import { BillNumber } from "./BillNumber"
import { SponsorsAndCommittees } from "./SponsorsAndCommittees"
import { Status } from "./Status"
import { SubmitTestimony } from "./SubmitTestimony"
import { Summary } from "./Summary"
import { BillProps } from "./types"
import { LabeledContainer } from "./LabeledContainer"

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
      <Row className="mt-2">
        <Col>
          <Summary bill={bill} />
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          {/* <Col md={8}> */}
          <SponsorsAndCommittees bill={bill} />
          <LabeledContainer className="mt-3">
            <div className="mb-2 title">Testimony</div>
            <BillTestimonies bill={bill.content} />
          </LabeledContainer>
        </Col>
        {/* <Col md={4}>
          <SubmitTestimony> SubmitTestimony</SubmitTestimony>
        </Col> */}
      </Row>
    </StyledContainer>
  )
}
