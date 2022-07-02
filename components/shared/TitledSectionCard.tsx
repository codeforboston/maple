import React from "react"
import { Card, Row, Col } from "../bootstrap"
import styled from "styled-components"

const StyledCard = styled(Card)`
  margin: 1rem;
  border-radius: 1rem;
  background: var(--bs-white);
`

const StyledHeader = styled(Card.Header)`
  border-radius: 0 5rem 5rem 0;
  background-color: var(--bs-red);
  color: white;
  font-weight: bold;
  width: max-content;
  height: 1.8em;
  line-height: 1.2em;
  padding-right: 4rem;
  padding-left: 2rem;
  transform: translate(-2rem, 1em);
  overflow: hidden;
`

const StyledFooter = styled(Card.Footer)`
  border-radius: 0 0 1rem 1rem;
  background: var(--bs-secondary);
`

const TitledSectionCard = ({
  title,
  children,
  footer,
  bug,
  className
}: {
  title: string
  children: React.ReactNode
  footer?: React.ReactElement
  bug?: React.ReactElement
  className?: string
}) => {
  return (
    <StyledCard className={className}>
      <StyledHeader className={`h4`} style={{ borderRadius: "0 5rem 5rem 0" }}>
        {title}
      </StyledHeader>
      <Bug>{bug}</Bug>
      <Card.Body className={`mx-3`}>{children}</Card.Body>

      {footer && (
        <StyledFooter style={{ borderRadius: "0 0 1rem 1rem" }}>
          {footer}
        </StyledFooter>
      )}
    </StyledCard>
  )
}

export const Bug = ({
  children
}: {
  children: React.ReactElement | undefined
}) => {
  return (
    <Row className={`justify-content-end`}>
      {children && (
        <Col className={`mt-5 mt-sm-0 mx-4 d-flex justify-content-start justify-content-sm-end`}>
          {children}
        </Col>
      )}
    </Row>
  )
}

export default TitledSectionCard
