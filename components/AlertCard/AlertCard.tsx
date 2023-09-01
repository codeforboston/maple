import { CardTitle } from "components/Card"
import OrgPriorityCardStories from "stories/billDetail/OrgPriorityCard.stories"
import { Card as MapleCard } from "../Card/Card"
import styles from "./AlertCard.module.css"
import { AlertCardBody } from "./AlertCardBody"
import { Timestamp } from "firebase/firestore"

export const AlertCard = (props: {
  header: string
  subheader: string
  timestamp: Timestamp
  headerImgSrc: string
  bodyImgSrc: string
  bodyImgAltTxt: string
  bodyText: string
}) => {
  const date = props.timestamp.toDate()
  const formattedTimestamp = `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`
  const header = (
    <CardTitle
      header={props.header}
      subheader={props.subheader}
      timestamp={formattedTimestamp}
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
