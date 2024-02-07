import { Container, Row, Col, Card } from "../bootstrap"
import {
  WritingContent,
  OralContent,
  WriteOrCallContent
} from "./CommunicatingWithLegislatorsContent"
import styled from "styled-components"

const StyledContainer = styled(Container)`
  p {
    letter-spacing: -0.625px;
  }
`

const StyledCardBody = styled(Card.Body)`
  letter-spacing: -0.625px;
  line-height: 2.05rem;
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
      <Card className={"my-5 mx-2 rounded-3 bg-white pb-4 pb-lg-5"}>
        <Card.Title as="h2" className={"mx-auto mt-4 fs-1"}>
          {title}
        </Card.Title>
        <StyledCardBody className="px-sm-4 mx-sm-4 p-lg-0 m-lg-0 fs-4">
          {children}
        </StyledCardBody>
      </Card>
    )
  }

  return (
    <StyledContainer>
      <Row className={"mb-5"}>
        <Col fluid="m" lg={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
          <h1 className={"fw-bold text-center display-4 mt-5 mx-n4"}>
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
