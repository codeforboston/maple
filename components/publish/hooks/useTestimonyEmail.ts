import { useEffect, useState } from "react"
import { getPublishedTestimonyAttachmentUrl } from "../../db"
import { formatBillId } from "../../formatting"
import { siteUrl } from "../../links"
import { usePublishState } from "./usePublishState"

/** Generates the email sent to legislators. */
export const useTestimonyEmail = () => {
  const { share, position, bill, content, publication } = usePublishState()

  const [attachment, setAttachment] = useState<{ url?: string } | undefined>()
  useEffect(() => {
    if (publication) {
      if (publication?.attachmentId)
        getPublishedTestimonyAttachmentUrl(publication.attachmentId).then(url =>
          setAttachment({ url })
        )
      else setAttachment({})
    }
  }, [publication])

  const to = share.recipients
      .map(r => `${r.Name} <${r.EmailAddress}>`)
      .join(","),
    billId = formatBillId(bill?.id!),
    intro = `As your constituent, I am writing to let you know that I ${position} bill ${billId}: "${bill?.content.Title}".`,
    billUrl = siteUrl(`/bills?billId=${bill?.id!}`),
    ending = `See more testimony for this bill at ${billUrl}`,
    subjectPosition =
      position == "endorse"
        ? "Support of"
        : position == "oppose"
        ? "Opposition to"
        : "Opinion on",
    subject = `${subjectPosition} Bill ${billId}`

  const sections = [
      intro,
      content,
      attachment ? attachment.url : null,
      ending
    ].filter(Boolean),
    body = sections.join("\n\n")

  const mailToUrl = encodeURI(`mailto:${to}?subject=${subject}&body=${body}`)

  if (attachment) {
    return { ready: true, mailToUrl, body, to } as const
  } else {
    return { ready: false } as const
  }
}
