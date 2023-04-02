import { ImageButton } from "components/buttons"
import clsx from "clsx"
import { formUrl } from "../hooks"

export const EditTestimonyButton = ({
  className,
  billId,
  court
}: {
  className?: string
  billId: string
  court: number
}) => {
  const url = formUrl(billId, court)

  return (
    <ImageButton
      alt="edit testimony"
      tooltip="Edit Testimony"
      src="/edit-testimony.svg"
      href={url}
      className={clsx("testimony-button", className)}
    />
  )
}
