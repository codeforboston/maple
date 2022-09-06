import { useEffect, useState } from "react"
import { getPublishedTestimonyAttachmentUrl, useProfile } from "../../db"
import { formatBillId, splitParagraphs } from "../../formatting"
import { siteUrl } from "../../links"
import { positionActions } from "../content"
import { usePublishState } from "./usePublishState"

/** Generates the email sent to legislators. */
export const useTestimonyEmail = () => {
  const { share, position, bill, content, publication } = usePublishState()
  const { profile } = useProfile()

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
    intro = `As your constituent, I am writing to let you know that I ${
      positionActions[position!]
    } bill ${billId}: "${bill?.content.Title.trim()}".`,
    billUrl = siteUrl(`/bills?billId=${bill?.id!}`),
    attachmentSection = attachment
      ? `Read more of my testimony at ${attachment.url}`
      : null,
    cta = `Please see more testimony for this bill at ${billUrl}`,
    ending = `Thank you for taking the time to read this email.\n\nSincerely,\n${
      profile?.fullName ?? ""
    }`,
    subjectPosition =
      position == "endorse"
        ? "Support of"
        : position == "oppose"
        ? "Opposition to"
        : "Opinion on",
    subject = `${subjectPosition} Bill ${billId}`

  const sections = [
      intro,
      ...splitParagraphs(content!),
      attachmentSection,
      cta,
      ending
    ].filter(Boolean),
    body = sections.join("\n\n")

  const mailToUrl = `mailto:${encodeURIComponent(
    to
  )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  if (attachment && profile) {
    return { ready: true, mailToUrl, body, to } as const
  } else {
    return { ready: false } as const
  }
}
