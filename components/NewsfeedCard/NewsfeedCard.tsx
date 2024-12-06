import styled from "styled-components"
import { Timestamp } from "firebase/firestore"
import { Card as MapleCard } from "../Card/Card"
import {
  NewsfeedBillCardBody,
  NewsfeedTestimonyCardBody
} from "./NewsfeedCardBody"
import { CardTitle } from "components/Card"

const Container = styled.div`
  max-width: 700px;
`

export const NewsfeedCard = (props: {
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
      isUserMatch={props.isUserMatch}
      type={props.type}
    />
  )

  let body = (
    <NewsfeedTestimonyCardBody
      imgSrc={props.bodyImgSrc}
      imgAltTxt={props.bodyImgAltTxt}
      text={props.bodyText}
      timestamp={formattedTimestamp}
    />
  )

  if (props.type == `bill`) {
    body = (
      <NewsfeedBillCardBody
        imgSrc={props.bodyImgSrc}
        imgAltTxt={props.bodyImgAltTxt}
        text={props.bodyText}
        timestamp={formattedTimestamp}
      />
    )
  }

  return (
    <Container>
      <MapleCard headerElement={header} body={body} />
    </Container>
  )
}
