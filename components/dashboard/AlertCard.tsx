import { CardTitle} from "components/Card"
import { Card as MapleCard } from "../Card/Card"
import Styles from "./AlertCard.module.css"

export const AlertCard = (props: {
  header: string
  subheader: string
  timestamp: string
  headerImgSrc: string
  bodyImgSrc: string
  bodyText: string
}) => {

  const header = <CardTitle 
    header={props.header} 
    subheader={props.subheader}
    timestamp={props.timestamp} 
    imgSrc={props.headerImgSrc}
  />

  return <MapleCard headerElement={header} bodyText={props.bodyText} imgSrc={props.bodyImgSrc}/>
}