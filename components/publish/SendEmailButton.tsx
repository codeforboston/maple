import type { ButtonProps } from "react-bootstrap"
import { Button } from "../bootstrap"
import { formatBillId } from "../formatting"
import { siteUrl } from "../links"
import { usePublishState } from "./redux"

export const SendEmailButton = (props: ButtonProps) => {
  const url = useMailtoLink()
  return (
    <Button
      href={url}
      target="_blank"
      rel="noreferrer"
      variant="secondary"
      {...props}
    >
      Open Email Draft
    </Button>
  )
}

// TODO: link to attachment
const useMailtoLink = () => {
  const { share, position, bill, content } = usePublishState()

  const to = share.recipients
      .map(r => `${r.Name} <${r.EmailAddress}>`)
      .join(","),
    billId = formatBillId(bill?.id!),
    intro = `As your constituent, I am writing to let you know that I ${position} Bill ${billId}: "${bill?.content.Title}".`,
    billUrl = siteUrl(`/bills?billId=${bill?.id!}`),
    ending = `See more testimony for this bill at ${billUrl}`,
    subjectPosition =
      position == "endorse"
        ? "Support of"
        : position == "oppose"
        ? "Opposition to"
        : "Opinion on",
    subject = `${subjectPosition} Bill ${billId}`,
    body = `${intro}\n\n${content}\n\n${ending}`

  const link = encodeURI(`mailto:${to}?subject=${subject}&body=${body}`)
  return link
}
