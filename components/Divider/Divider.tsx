import React from "react"
import { Col, Row } from "../bootstrap"

export default function Divider({ children }: { children: React.ReactNode }) {
  return (
    <Row>
      <Col>
        <hr />
      </Col>
      <Col className="col-auto">{children}</Col>
      <Col>
        <hr />
      </Col>
    </Row>
  )
}
