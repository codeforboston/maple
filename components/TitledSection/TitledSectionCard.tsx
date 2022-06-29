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
      <Bug>{bug}</Bug>
      <Card.Body className={`${styles.body}`}>{children}</Card.Body>

      {footer && (
        <Card.Footer className={`${styles.footer}`}>{footer}</Card.Footer>
      )}
    </Card>
  )
}

export const Bug = ({
  children
}: {
  children: React.ReactElement | undefined
}) => {
  return <Row className={`justify-content-end align-items-center`}>{children && <Col xs={12} sm={6} md={2} className={`mt-4`}>{children}</Col>}</Row>
}

export default TitledSectionCard
