import { Container, Row, Col, Card } from "../bootstrap"
import {
  WritingContent,
  OralContent,
  WriteOrCallContent
} from "./CommunicatingWithLegislatorsContent"
import styled from "styled-components"

const StyledContainer = styled(Container)`
  max-width: 900px;
  p {
    letter-spacing: -0.625px;
  }
`

const StyledCardBody = styled(Card.Body)`
  font-size: 1.5rem;
  text-align: left;
  padding-left: 5.4375rem;
  padding-right: 5.4375rem;
  padding-bottom: 2.96875rem;
  letter-spacing: -0.625px;
  line-height: 2.05rem;
  @media (max-width: 62em) {
    padding-left: 4rem;
    padding-right: 4rem;
  }

  /* bootstrap: medium > 768px */
  @media (max-width: 48em) {
    padding-left: 3rem;
    padding-right: 3rem;
    padding-bottom: 2rem;
  }

  /* bootstrap: small > 576px */
  @media (max-width: 36em) {
    font-size: 1.25rem;
    padding-left: 2rem;
    padding-right: 2rem;
    padding-bottom: 1.75rem;
    line-height: 1.75rem;
  }

  /* bootstrap: xs < 576px
   this break at 464px */
  @media (max-width: 26em) {
    font-size: 1rem;
    padding-left: 1rem;
    padding-right: 1rem;
    padding-bottom: 1.5rem;
    line-height: 1.5rem;
  }
`

const CommunicatingWithLegislators = () => {
  const CommWithLegCard = ({
    title,
    children
  }: {
    title: string
    children: JSX.Element
  }): JSX.Element => {
    return (
      <Card className={"my-5 mx-2 rounded-3 text-bg-light"}>
        <Card.Title as="h2" className={"mx-auto mt-4 fs-1"}>
          {title}
        </Card.Title>
        <StyledCardBody>{children}</StyledCardBody>
      </Card>
    )
  }

  return (
    <StyledContainer>
      <Row className={"mb-5"}>
        <Col>
          <h1 className={"fw-bold text-center display-4 mt-5"}>
            Communicating with Legislators
          </h1>
          <p className={"ms-1 fs-4"}>
            There are multiple ways to share your perspective and knowledge with
            your legislators.
          </p>

          <CommWithLegCard title="Testify in writing">
            <WritingContent />
          </CommWithLegCard>

          <CommWithLegCard title="Testify orally">
            <OralContent />
          </CommWithLegCard>

          <CommWithLegCard title="Write or call them">
            <WriteOrCallContent />
          </CommWithLegCard>
        </Col>
      </Row>
    </StyledContainer>
  )
}

export default CommunicatingWithLegislators
