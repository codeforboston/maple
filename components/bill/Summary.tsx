import styled from "styled-components"
import { Col, Container, Row } from "../bootstrap"
import { TestimonyCounts } from "./TestimonyCounts"
import { BillProps } from "./types"

const SummaryContainer = styled(Container)`
  background-color: white;
  border-radius: 0.75rem;
  padding: 1rem;
  background-image: url("quote-left.svg");
  background-repeat: no-repeat;
  background-size: 3rem;
  background-position: 0.5rem 0.5rem;
`

const Pinslip = styled(Col)`
  margin-top: 1rem;
  font-style: italic;
  font-size: 1.25rem;
`

const Divider = styled(Col)`
  width: 1px;
  padding: 0;
  background-color: var(--bs-blue-100);
  align-self: stretch;
`

export const Summary = ({
  bill,
  className
}: BillProps & { className?: string }) => {
  return (
    <SummaryContainer className={className}>
      <Row>
        <Pinslip> {bill.content.Pinslip}</Pinslip>
        <Divider xs="auto" />
        <Col xs="auto">
          <TestimonyCounts bill={bill} />
        </Col>
      </Row>
    </SummaryContainer>
  )
}
