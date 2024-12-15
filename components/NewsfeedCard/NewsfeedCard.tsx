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
  timestamp: Timestamp
  type: string
  userRole?: string
}) => {
  const date = props.timestamp.toDate()
  const formattedTimestamp = `${date.toLocaleDateString()}`
  const header = (
    <CardTitle
      authorUid={props.authorUid}
      court={props.court}
      header={props.header}
      subheader={props.subheader}
      timestamp={formattedTimestamp}
      isBillMatch={props.isBillMatch}
      isUserMatch={props.isUserMatch}
      type={props.type}
      userRole={props.userRole}
    />
  )

  let body = (
    <NewsfeedTestimonyCardBody
      position={props.position}
      text={props.bodyText}
      timestamp={formattedTimestamp}
      type={props.type}
    />
  )

  if (props.type == `bill`) {
    body = (
      <NewsfeedBillCardBody
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
