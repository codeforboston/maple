import { formatTestimony, formatTestimonyPlaintext } from "components/testimony"
import { useEffect, useState } from "react"
import { getPublishedTestimonyAttachmentUrl, useProfile } from "../../db"
import { formatBillId } from "../../formatting"
import { maple, siteUrl } from "../../links"
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
    testimonyUrl =
      publication && siteUrl(maple.testimony({ publishedId: publication.id })),
    cta = `You can see my full testimony at ${testimonyUrl}`,
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

  const markdownBody = [intro, content, cta, ending]
    .filter(Boolean)
    .join("\n\n")

  const plainBody = formatTestimonyPlaintext(markdownBody),
    htmlBody = formatTestimony(markdownBody).__html

  const mailToUrl = `mailto:test@example.com?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(plainBody)}`

  if (attachment && profile) {
    return { ready: true, mailToUrl, body: htmlBody, to } as const
  } else {
    return { ready: false } as const
  }
}
