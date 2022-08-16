import styled from "styled-components"
import { Col, Container, Row, Button } from "../bootstrap"
import { TestimonyCounts } from "./TestimonyCounts"
import { BillProps } from "./types"

const SummaryContainer = styled(Container)`
  background-color: white;
  border-radius: 0.75rem;
  padding: 1rem;
  background-image: url("quote-left.svg");
  background-repeat: no-repeat;
  background-size: 4rem;
  background-position: 0.5rem 0.5rem;
`

const Pinslip = styled(Col)`
  margin-top: 1rem;
  font-style: italic;
  font-size: 1.25rem;
`

const ReadMore = styled(Col)`
  margin-top: 1rem;
  font-family: "Nunito";
  color: blue;
  font-style: normal;
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
        <Pinslip>
          {bill.content.Pinslip}
          <ReadMore>
            <div className="d-flex justify-content-end">Read more..</div>
          </ReadMore>
        </Pinslip>

        <Divider xs="auto" />
        <Col xs="auto">
          <TestimonyCounts bill={bill} />
        </Col>
      </Row>
    </SummaryContainer>
  )
}
