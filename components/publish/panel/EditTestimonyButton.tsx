import { ImageButton } from "components/buttons"
import clsx from "clsx"
import { formUrl } from "../hooks"
import { useTranslation } from "next-i18next"

export const EditTestimonyButton = ({
  className,
  billId,
  court,
  ballotQuestionId
}: {
  className?: string
  billId: string
  court: number
  ballotQuestionId?: string
}) => {
  const { t } = useTranslation("testimony")
  const url = formUrl(billId, court, "position", ballotQuestionId)
  const editLabel = ballotQuestionId
    ? t("ballotQuestion.testimonyItem.edit")
    : t("testimonyItem.edit")

  return (
    <ImageButton
      alt={editLabel}
      tooltip={editLabel}
      src="/edit-testimony.svg"
      href={url}
      className={clsx("testimony-button", className)}
    />
  )
}
