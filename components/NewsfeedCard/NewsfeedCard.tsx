import styled from "styled-components"
import { Timestamp } from "firebase/firestore"
import { Card as MapleCard } from "../Card/Card"
import { flags } from "../featureFlags"
import {
  NewsfeedBallotQuestionCardBody,
  NewsfeedBillCardBody,
  NewsfeedConferenceTestimonyCardBody,
  NewsfeedTestimonyCardBody
} from "./NewsfeedCardBody"
import NewsfeedCardTitle from "./NewsfeedCardTitle"
import { maple } from "components/links"
import { CosignOf } from "../Newsfeed/NotificationProps"

const Container = styled.div`
  max-width: 700px;
`

export const NewsfeedCard = (props: {
  authorUid?: string
  ballotQuestionId?: string
  ballotStatus?: string
  billId?: string
  bodyText: string
  conferenceId?: string | null
  conferenceName?: string | null
  cosignOf?: CosignOf | null
  court?: string
  header: string
  isBallotQuestionMatch?: boolean
  isBillMatch?: boolean
  isConferenceMatch?: boolean
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
  const conferenceHref = props.conferenceId
    ? maple.conference({ court: Number(props.court), id: props.conferenceId })
    : undefined
  const header = (
    <NewsfeedCardTitle
      authorUid={props.authorUid}
      billId={props.billId}
      conferenceHref={conferenceHref}
      conferenceName={props.conferenceName}
      cosigned={!!props.cosignOf}
      court={props.court}
      header={props.header}
      isBallotQuestionMatch={props.isBallotQuestionMatch}
      isBillMatch={props.isBillMatch}
      isConferenceMatch={props.isConferenceMatch}
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

  if (props.type == `testimony` && conferenceHref) {
    body = (
      <NewsfeedConferenceTestimonyCardBody
        billText={props.header}
        conferenceHref={conferenceHref}
        cosignOf={props.cosignOf}
        position={props.position}
        text={props.bodyText}
        timestamp={formattedTimestamp}
      />
    )
  } else if (props.type == `testimony`) {
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
  } else if (props.type == `ballotQuestion` && flags().ballotQuestions) {
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
