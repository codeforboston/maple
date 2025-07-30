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
  authorUid?: string
  billId?: string
  bodyText: string
  court?: string
  header: string
  isBillMatch?: boolean
  isUserMatch?: boolean
  position?: string
  subheader?: string
  testimonyId?: string
  timestamp: Timestamp
  type: string
  userRole?: string
  isNewsfeed?: string
}) => {
  const date = props.timestamp.toDate()
  const formattedTimestamp = `${date.toLocaleDateString()}`
  const header = (
    <CardTitle
      authorUid={props.authorUid}
      billId={props.billId}
      court={props.court}
      header={props.header}
      isBillMatch={props.isBillMatch}
      isUserMatch={props.isUserMatch}
      subheader={props.subheader}
      timestamp={formattedTimestamp}
      type={props.type}
      userRole={props.userRole}
      isNewsfeed={"enable newsfeed specific subheading"}
    />
  )

  let body = (
    <NewsfeedBillCardBody
      position={props.position}
      text={props.bodyText}
      timestamp={formattedTimestamp}
    />
  )

  if (props.type == `testimony`) {
    body = (
      <NewsfeedTestimonyCardBody
        billText={props.header}
        position={props.position}
        text={props.bodyText}
        testimonyId={props.testimonyId}
        timestamp={formattedTimestamp}
        type={props.type}
      />
    )
  }

  return (
    <Container>
      <MapleCard headerElement={header} body={body} />
    </Container>
  )
}
