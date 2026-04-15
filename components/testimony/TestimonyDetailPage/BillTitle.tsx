import { formatBillId } from "components/formatting"
import { Internal, maple } from "components/links"
import styled from "styled-components"
import { useCurrentTestimonyDetails } from "./testimonyDetailSlice"

function formatBallotQuestionTitle(ballotQuestion: {
  id: string
  title?: string | null
  description?: string | null
}) {
  const title = ballotQuestion.title ?? ballotQuestion.description
  return title
    ? `Ballot Question ${ballotQuestion.id}: ${title}`
    : `Ballot Question ${ballotQuestion.id}`
}

export const BillTitle = styled(props => {
  const { bill, ballotQuestion } = useCurrentTestimonyDetails()

  const href = ballotQuestion
    ? maple.ballotQuestion(ballotQuestion)
    : maple.bill(bill)
  const title = ballotQuestion
    ? formatBallotQuestionTitle(ballotQuestion)
    : `${formatBillId(bill.content.BillNumber)}: ${bill.content.Title}`

  return (
    <h3 {...props}>
      <Internal href={href}>{title}</Internal>
    </h3>
  )
})`
  font-size: 2rem;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`
