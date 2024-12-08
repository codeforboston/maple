import { Card, Col } from "react-bootstrap"
import styled from "styled-components"

export type AboutInfoCardProps = {
  title: string
  bodytext: string
  options?: {}
}

const StyledCardHeader = styled(Card.Header)`
  transform: translateY(-40%);
`

const StyledCardBody = styled(Card.Body)`
  height: fit-content;
`

export default function AboutInfoCard({ title, bodytext }: AboutInfoCardProps) {
  return (
    <Col className="my-3">
      <Card className="h-100 bg-white">
        <StyledCardHeader
          forwardedAs="h3"
          className="text-center align-self-center bg-warning text-white rounded-0 border-0 mb-n3 overflow-visible"
        >
          {title}
        </StyledCardHeader>
        <StyledCardBody>
          <p className={`h-100 mb-2 overflow-visible`}>{bodytext}</p>
        </StyledCardBody>
      </Card>
    </Col>
  )
}
