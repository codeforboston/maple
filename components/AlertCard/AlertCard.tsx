import { CardTitle } from "components/Card"
import { Timestamp } from "firebase/firestore"
import { Card as MapleCard } from "../Card/Card"
import { AlertCardBody } from "./AlertCardBody"

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
  const date = props.timestamp

  // const date = props.timestamp.toDate()

  /* toDate is not a function error                *
   * some change to the code is making date        *
   * alternate between being an object or a string */

  // const formattedTimestamp = `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`

  const header = (
    <>
      {typeof date == "string" ? (
        <CardTitle
          header={props.header}
          subheader={props.subheader}
          timestamp={date}
          imgSrc={props.headerImgSrc}
        />
      ) : (
        <CardTitle
          header={props.header}
          subheader={props.subheader}
          imgSrc={props.headerImgSrc}
        />
      )}
    </>
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
