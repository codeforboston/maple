import React from "react"
import styled from "styled-components"
import { Card } from "../bootstrap"

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  color: var(--maple-text-inverse);
  background: var(--maple-brand-primary);
  font-size: 1.25rem;
  font-weight: 600;
  text-transform: capitalize;
  padding: var(--maple-space-lg) var(--maple-space-xl);
  border-radius: var(--maple-radius-lg) var(--maple-radius-lg) 0 0;
`

const SurfaceCard = styled(Card)`
  background-color: var(--maple-surface-base);
  border: 1px solid var(--maple-surface-border);
  border-radius: var(--maple-radius-xl);
  box-shadow: var(--maple-shadow-sm);
  overflow: hidden;
`

export const Header = ({ title }: { title: string }) => {
  return <HeaderContainer>{title}</HeaderContainer>
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
    <SurfaceCard className={`flex-grow-1 ${className}`}>
      {title && <Header title={title} />}
      <Card.Body className={`px-4 py-3`}>{children}</Card.Body>
      {footer && (
        <Card.Body
          className={`align-items-center d-flex pe-3 justify-content-end`}
        >
          {footer}
        </Card.Body>
      )}
    </SurfaceCard>
  )
}

export default TitledSectionCard
