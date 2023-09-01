import { CardTitle } from "components/Card"
import OrgPriorityCardStories from "stories/billDetail/OrgPriorityCard.stories"
import { Card as MapleCard } from "../Card/Card"
import styles from "./AlertCard.module.css"
import { AlertCardBody } from "./AlertCardBody"

export const AlertCard = (props: {
  header: string
  subheader: string
  timestamp: string
  headerImgSrc: string
  bodyImgSrc: string
  bodyImgAltTxt: string
  bodyText: string
}) => {
  const header = (
    <CardTitle
      header={props.header}
      subheader={props.subheader}
      timestamp={props.timestamp}
      imgSrc={props.headerImgSrc}
    />
  )

  const body = (
    <AlertCardBody
      imgSrc={props.bodyImgSrc}
      imgAltTxt={props.bodyImgAltTxt}
      text={props.bodyText}
    />
  )

  return <MapleCard headerElement={header} body={body} />
}
