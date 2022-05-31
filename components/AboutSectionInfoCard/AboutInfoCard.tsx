import { Button, Card, Col, Container } from "react-bootstrap"
import styles from "./AboutInfoCard.module.css"

export type AboutInfoCardProps = {
  title: string
  bodytext: string
  options?: {}
}

export default function AboutInfoCard({ title, bodytext }: AboutInfoCardProps) {
  return (
    <Col className="my-3">
      <Card className="h-100">
        <Card.Header
          as="h3"
          className={`text-center align-self-center text-white rounded-0 ${styles.cardHeader}`}
        >
          {title}
        </Card.Header>
        <Card.Body className={`${styles.cardBody}`}>
          <p className={`${styles.cardBodyParagraph}`}>{bodytext}</p>
        </Card.Body>
      </Card>
    </Col>
  )
}
