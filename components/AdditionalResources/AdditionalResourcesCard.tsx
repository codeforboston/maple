import { Card } from "../bootstrap"
// import { Card } from "../Card/Card"
import { FC, PropsWithChildren } from "react"
import { CardProps } from "react-bootstrap"




const AdditionalResourcesCard: FC<PropsWithChildren<CardProps>> = ({ children, ...rest }) => {
  return (
    <Card className={`m-4 py-0 text-bg-light rounded-4`} >
      {children}
    </Card>
  )
}

export default AdditionalResourcesCard
