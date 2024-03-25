import clsx from "clsx"
import React from "react"
import type { RowProps } from "react-bootstrap"
import { Col, Row } from "../bootstrap"
import styled from "styled-components"

const Line = styled("hr")`
  height: 2px !important;
  opacity: 1;
`
export default function Divider({
  children,
  className,
  ...restProps
}: RowProps) {
  return (
    <Row {...restProps} className={clsx("text-secondary", className)}>
      <Col>
        <Line />
      </Col>
      <Col className="col-auto fs-5">{children}</Col>
      <Col>
        <Line />
      </Col>
    </Row>
  )
}
