import React from "react"
import { Card } from "../bootstrap"

export const Header = ({ title }: { title: string }) => {
  return (
    <div
      className={` d-flex align-items-center justify-content-start text-white h5 text-capitalize bg-secondary px-3 py-2 rounded-top-3 `}
    >
      {title}
    </div>
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
    <Card className={`bg-white rounded-4 flex-grow-1 border-none ${className}`}>
      {title && <Header title={title} />}
      <Card.Body className={`px-4 py-3 rounded-top-4`}>{children}</Card.Body>
      {footer && (
        <Card.Body
          className={`rounded-bottom-3 align-items-center d-flex pe-3 justify-content-end`}
        >
          {footer}
        </Card.Body>
      )}
    </Card>
  )
}

export default TitledSectionCard
