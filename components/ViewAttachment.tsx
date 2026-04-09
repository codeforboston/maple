import { useTranslation } from "next-i18next"
import { Testimony, usePublishedTestimonyAttachment } from "./db"
import { External } from "./links"
import styled from "styled-components"

const StyledExternal = styled(External)`
  text-decoration: none;
`

export function ViewAttachment({ testimony }: { testimony?: Testimony }) {
  const id = testimony?.attachmentId
  return id ? (
    <Open id={id} isBallotQuestion={Boolean(testimony?.ballotQuestionId)} />
  ) : null
}

const Open = ({
  id,
  isBallotQuestion
}: {
  id: string
  isBallotQuestion: boolean
}) => {
  const { t } = useTranslation("testimony")

  const url = usePublishedTestimonyAttachment(id)
  return url ? (
    <StyledExternal href={url}>
      {t(isBallotQuestion ? "ballotQuestion.viewAttached" : "viewAttached")}
    </StyledExternal>
  ) : null
}
