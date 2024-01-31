import { Card } from "../bootstrap"
// import { Card } from "../Card/Card"
import { FC, PropsWithChildren } from "react"
import { CardProps } from "react-bootstrap"

const AdditionalResourcesCard: FC<PropsWithChildren<CardProps>> = ({
  children,
  ...rest
}) => {
  return (
    <Card
      className={`m-4 py-2 px-4 text-bg-light rounded-4 d-flex align-items-center align-items-sm-start`}
    >
      {children}
    </Card>
  )
}

export default AdditionalResourcesCard
