import { Container, Row, Col, Card } from "../bootstrap"
import {
  WritingContent,
  OralContent,
  WriteOrCallContent
} from "./CommunicatingWithLegislatorsContent"
import styles from "./CommunicatingWithLegislators.module.css"

const CommunicatingWithLegislators = () => {
  const CommWithLegCard = ({
    title,
    children
  }: {
    title: string
    children: JSX.Element
  }): JSX.Element => {
    return (
      <Card className={styles.card}>
        <Card.Title as="h2" className={`mx-auto ${styles.title}`}>
          {title}
        </Card.Title>
        <Card.Body className={styles.body}>{children}</Card.Body>
      </Card>
    )
  }

  return (
    <Container>
      <Row className={styles.container}>
        <Col>
          <h1 className={styles.pageHeading}>Communicating with Legislators</h1>
          <p className={styles.subHeading}>
            There are multiple ways for you to voice your opinion to your
            legislators.
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
    </Container>
  )
}

export default CommunicatingWithLegislators
