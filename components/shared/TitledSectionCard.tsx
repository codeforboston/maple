import React, { ReactNode } from "react"
import { Card, Row, Col } from "../bootstrap"
import styled from "styled-components"

const StyledCard = styled(Card)`
  margin: 1rem;
  border-radius: 1rem;
  background: var(--bs-white);
`

const HeaderTitle = styled.div.attrs({
  className: "h4"
})`
  color: white;
  font-weight: bold;
  border-radius: 0 5rem 5rem 0;
  background-color: var(--bs-red);
  height: 1.8em;
  line-height: 1.8em;
  padding-left: 2rem;
  padding-right: 2rem;
  min-width: 15rem;
  width: fit-content;

  margin-left: -2em;
`

const Header = ({ title, bug }: { title: string; bug?: ReactNode }) => {
  return (
    <Row className={`my-4 align-items-center`}>
      <Col>
        <HeaderTitle>{title}</HeaderTitle>
      </Col>
      <Col className={`col-auto my-3 mx-5`}>{bug}</Col>
    </Row>
  )
}

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
      <Header title={title} bug={bug} />
      <Card.Body className={`mx-3`}>{children}</Card.Body>

      {footer && (
        <StyledFooter style={{ borderRadius: "0 0 1rem 1rem" }}>
          {footer}
        </StyledFooter>
      )}
    </StyledCard>
  )
}

export default TitledSectionCard
