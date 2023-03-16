import React, { ReactNode } from "react"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"
import { Card, Col, Row } from "../bootstrap"

const StyledCard = styled(Card)`
  flex-grow: 1;
  border-radius: 1rem;
  background: var(--bs-white);
  border: none;
`

export const HeaderTitle = styled.div.attrs({
  className: "text-capitalize"
})`
  display: flex;
  align-items: center;
  color: white;
  font-size: 1.375rem;
  font-family: Nunito;
  background-color: var(--bs-blue);
  height: 2.5rem;
  padding: 1.5rem 2rem;
  min-width: 15rem;
  border-radius: 1rem 1rem 0 0;

`

export const Header = ({ title, bug }: { title: string; bug?: ReactNode }) => {
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <Row className="align-items-start">
      <Col>
        <HeaderTitle>{title}</HeaderTitle>
      </Col>
    </Row>
  )
}

export const StyledBody = styled(Card.Body).attrs({
  className: `mx-1 mx-md-3`
})``

type TitledSectionCardProps = {
  title?: string
  footer?: React.ReactElement
  bug?: React.ReactElement
  className?: string
  children: React.ReactNode
}

const TitledSectionCard = ({
  title,
  children,
  className
}: TitledSectionCardProps) => {
  return (
    <StyledCard className={className}>
      {title && <Header title={title}/>}
      <div className={`h-100`}>{children}</div>
    </StyledCard>
  )
}

export default TitledSectionCard
