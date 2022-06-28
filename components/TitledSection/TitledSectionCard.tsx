import React from "react"
import { Card, Row, Col } from "../bootstrap"
import styles from "./TitledSectionCard.module.css"

const TitledSectionCard = ({
  title,
  children,
  footer,
  bug
}: {
  title: string
  children: React.ReactNode
  footer?: React.ReactElement
  bug?: React.ReactElement
}) => {
  return (
    <Card className={styles.card}>
      <Card.Header as="h4" className={`fw-bold ${styles.header}`}>
        {title}
      </Card.Header>
      {bug && <Bug>{bug}</Bug>}
      <Card.Body className={`${styles.body}`}>{children}</Card.Body>

      {footer && (
        <Card.Footer className={`${styles.footer}`}>{footer}</Card.Footer>
      )}
    </Card>
  )
}

export const Bug = ({ children } : {children: React.ReactElement}) => {
  return (
    <Row  className={`${styles.bugContainer}`}>
      <Col xs={{ span: 2, offset: 10 }} className={`${styles.bug}`}>{children}</Col>
    </Row>
  )
}

export default TitledSectionCard
