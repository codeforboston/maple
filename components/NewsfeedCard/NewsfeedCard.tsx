import { CardTitle } from "components/Card"
import { Timestamp } from "firebase/firestore"
import { Card as MapleCard } from "../Card/Card"
import {
  NewsfeedBillCardBody,
  NewsfeedTestimonyCardBody
} from "./NewsfeedCardBody"

export const NewsfeedBillCard = (props: {
  court: string
  header: string
  subheader: string
  timestamp: Timestamp
  headerImgSrc: string
  headerImgTitle?: string
  bodyImgSrc: string
  bodyImgAltTxt: string
  bodyText: string
  isBillMatch: boolean
  type: string
}) => {
  const date = props.timestamp.toDate()
  const formattedTimestamp = `${date.toLocaleDateString()}`
  const header = (
    <CardTitle
      court={props.court}
      header={props.header}
      subheader={props.subheader}
      timestamp={formattedTimestamp}
      imgSrc={props.headerImgSrc}
      imgTitle={props.headerImgTitle ?? ""}
      isBillMatch={props.isBillMatch}
      type={props.type}
    />
  )

  const body = (
    <NewsfeedBillCardBody
      imgSrc={props.bodyImgSrc}
      imgAltTxt={props.bodyImgAltTxt}
      text={props.bodyText}
      timestamp={formattedTimestamp}
    />
  )

  return <MapleCard headerElement={header} body={body} />
}

export const NewsfeedTestimonyCard = (props: {
  court: string
  header: string
  subheader: string
  timestamp: Timestamp
  headerImgSrc: string
  headerImgTitle?: string
  bodyImgSrc: string
  bodyImgAltTxt: string
  bodyText: string
  isBillMatch: boolean
  isUserMatch: boolean
  type: string
}) => {
  const date = props.timestamp.toDate()
  const formattedTimestamp = `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`
  const header = (
    // <CardTitle
    //   header={props.header}
    //   subheader={props.subheader}
    //   timestamp={formattedTimestamp}
    //   imgSrc={props.headerImgSrc}
    //   imgTitle={props.headerImgTitle ?? ""}
    // />
    <CardTitle
      court={props.court}
      header={props.header}
      subheader={props.subheader}
      timestamp={formattedTimestamp}
      imgSrc={props.headerImgSrc}
      imgTitle={props.headerImgTitle ?? ""}
      isBillMatch={props.isBillMatch}
      isUserMatch={props.isUserMatch}
      type={props.type}
    />
  )

  const body = (
    <NewsfeedTestimonyCardBody
      imgSrc={props.bodyImgSrc}
      imgAltTxt={props.bodyImgAltTxt}
      text={props.bodyText}
    />
  )

  return <MapleCard headerElement={header} body={body} />
}
