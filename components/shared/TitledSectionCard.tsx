import React, { ReactNode } from "react"
import { Card, Row, Col } from "../bootstrap"
import styled from "styled-components"

const StyledCard = styled(Card)`
  margin: 1rem;
  border-radius: 1rem;
  background: var(--bs-white);
`

const HeaderTitle = styled.div.attrs({
  className: "text-capitalize"
})`
  color: white;
  font-size: 1.25rem;
  font-weight: bold;
  border-radius: 0 5rem 5rem 0;
  background-color: var(--bs-red);
  height: 2rem;
  line-height: 2rem;
  padding: 0 2rem;
  width: fit-content;
  min-width: 15rem;
  margin-left: -1rem;
`

const Header = ({ title, bug }: { title: string; bug?: ReactNode }) => {
  return (
    <Row className={`mt-4 align-items-start`}>
      <Col>
        <HeaderTitle>{title}</HeaderTitle>
      </Col>
      <Col className={`col-auto my-auto mx-5`}>{bug && bug}</Col>
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
        <Card.Body className={`mx-1 mx-md-3`}>{children}</Card.Body>
        {footer && (
          <StyledFooter style={{ borderRadius: "0 0 1rem 1rem" }}>
            {footer}
          </StyledFooter>
        )}
      </StyledCard>
  )
}

export default TitledSectionCard
