import { CardTitle, CardTitleV2 } from "components/Card"
import { Timestamp } from "firebase/firestore"
import { Card as MapleCard } from "../Card/Card"
import { AlertCardBody, AlertCardBodyV2 } from "./AlertCardBody"

export const AlertCard = (props: {
  header: string
  subheader: string
  timestamp: Timestamp
  headerImgSrc: string
  headerImgTitle?: string
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
      imgTitle={props.headerImgTitle ?? ""}
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

// newsfeed bill card
export const AlertCardV2 = (props: {
  court: string
  header: string
  subheader: string
  timestamp: Timestamp
  headerImgSrc: string
  headerImgTitle?: string
  bodyImgSrc: string
  bodyImgAltTxt: string
  bodyText: string
}) => {
  const date = props.timestamp.toDate()
  const formattedTimestamp = `${date.toLocaleDateString()}`
  const header = (
    <CardTitleV2
      court={props.court}
      header={props.header}
      subheader={props.subheader}
      timestamp={formattedTimestamp}
      imgSrc={props.headerImgSrc}
      imgTitle={props.headerImgTitle ?? ""}
    />
  )

  const body = (
    <AlertCardBodyV2
      imgSrc={props.bodyImgSrc}
      imgAltTxt={props.bodyImgAltTxt}
      text={props.bodyText}
      timestamp={formattedTimestamp}
    />
  )

  return <MapleCard headerElement={header} body={body} />
}
