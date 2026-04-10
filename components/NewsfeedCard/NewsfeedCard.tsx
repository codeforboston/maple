import styled from "styled-components"
import { Timestamp } from "firebase/firestore"
import { Card as MapleCard } from "../Card/Card"
import {
  NewsfeedBallotQuestionCardBody,
  NewsfeedBillCardBody,
  NewsfeedTestimonyCardBody
} from "./NewsfeedCardBody"
import NewsfeedCardTitle from "./NewsfeedCardTitle"

const Container = styled.div`
  max-width: 700px;
`

export const NewsfeedCard = (props: {
  authorUid?: string
  ballotQuestionId?: string
  ballotStatus?: string
  billId?: string
  bodyText: string
  court?: string
  header: string
  isBallotQuestionMatch?: boolean
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
    <NewsfeedCardTitle
      authorUid={props.authorUid}
      billId={props.billId}
      court={props.court}
      header={props.header}
      isBallotQuestionMatch={props.isBallotQuestionMatch}
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
  } else if (props.type == `ballotQuestion`) {
    body = (
      <NewsfeedBallotQuestionCardBody
        ballotQuestionId={props.ballotQuestionId}
        ballotStatus={props.ballotStatus}
        header={props.header}
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
