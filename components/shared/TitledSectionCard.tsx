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

const StyledHeader = styled.div.attrs({
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
const StyledBody = styled(Card.Body)`
  padding: 1.5rem 2rem;

`
const StyledFooter = styled(Card.Body)`
  border-radius: 0 0 1rem 1rem;
  border-top: 2px solid #D8D8D8;
  padding-right: 2rem;
  align-items: center;
`

const Header = ({ title }: { title: string}) => {
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <Row className="align-items-start">
      <Col>
        <StyledHeader>{title}</StyledHeader>
      </Col>
    </Row>
  )
}

type TitledSectionCardProps = {
  title?: string
  footer?: React.ReactElement
  className?: string
  children: React.ReactNode
}

const TitledSectionCard = ({
  title,
  children,
  footer,
  className
}: TitledSectionCardProps) => {
  return (
    <StyledCard className={className}>
      {title && <Header title={title}/>}
      <StyledBody>{children}</StyledBody>
      {footer && (
        <StyledFooter>
          {footer}
        </StyledFooter>
      )}
    </StyledCard>
  )
}

export default TitledSectionCard
