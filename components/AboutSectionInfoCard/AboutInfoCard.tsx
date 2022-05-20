import { Card, Col, Container } from "react-bootstrap"


export type AboutInfoCardProps = {
  title: string, 
  bodytext: string, 
  options?: {}
}

export default function AboutInfoCard({title, bodytext}: AboutInfoCardProps){
  return <Col>
    <Card className="h-100">
      <Card.Header as="h2" className="text-center w-50 align-self-center">{title}</Card.Header>
      <Card.Body>{bodytext}</Card.Body>
    </Card>
  </Col>
}