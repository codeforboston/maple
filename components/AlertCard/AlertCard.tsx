import { CardTitle } from "components/Card"
import { Card as MapleCard } from "../Card/Card"
import { AlertCardBody } from "./AlertCardBody"
import { Timestamp } from "firebase/firestore"
import styles from "./AlertCard.module.css"
import OrgPriorityCardStories from "stories/billDetail/OrgPriorityCard.stories"

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
