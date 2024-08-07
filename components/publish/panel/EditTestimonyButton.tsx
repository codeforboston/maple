import { ImageButton } from "components/buttons"
import clsx from "clsx"
import { formUrl } from "../hooks"
import { useTranslation } from "next-i18next"

export const EditTestimonyButton = ({
  className,
  billId,
  court
}: {
  className?: string
  billId: string
  court: number
}) => {
  const { t } = useTranslation("testimony")
  const url = formUrl(billId, court)

  return (
    <ImageButton
      alt={t("testimonyItem.edit")}
      tooltip="Edit Testimony"
      src="/edit-testimony.svg"
      href={url}
      className={clsx("testimony-button", className)}
    />
  )
}
