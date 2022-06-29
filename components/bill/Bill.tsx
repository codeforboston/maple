import styled from "styled-components"
import { Alert, Col, Container, Row, Spinner } from "../bootstrap"
import { useBill } from "../db"
import { formatBillId } from "../formatting"
import * as links from "../links"
import { BillStatus } from "./BillStatus"
import { Summary } from "./Summary"
import { BillProps } from "./types"

const StyledContainer = styled(Container)`
  font-family: "Nunito";
`

const Back = styled(links.Internal)`
  color: var(--bs-blue);
  margin-right: auto;

  :hover {
    color: var(--bs-blue-300);
  }
`

const BillId = styled.div`
  font-size: 4rem;
  height: 4rem;
  line-height: 4rem;
  pointer-events: none;
`

const Details = ({ bill }: BillProps) => {
  return (
    <StyledContainer className="mt-3">
      <Row>
        <Col>
          <Back href="/bills">Back to List of Bills</Back>
        </Col>
      </Row>
      <Row>
        <Col>
          <BillId>{formatBillId(bill.id)}</BillId>
        </Col>
        <Col xs={6}>
          <BillStatus bill={bill} />
        </Col>
      </Row>
      <Row>
        <Col>
          <Summary className="mt-4" bill={bill} />
        </Col>
      </Row>
    </StyledContainer>
  )
}

export const BillDetails = ({ billId }: { billId: string }) => {
  const { loading, error, result: bill } = useBill(billId)

  if (loading) {
    return (
      <Row>
        <Spinner animation="border" className="mx-auto" />
      </Row>
    )
  } else if (error) {
    return (
      <Alert variant="danger">An error occured. Please refresh the page.</Alert>
    )
  } else if (bill) {
    return <Details bill={bill} />
  }
  return null
}
