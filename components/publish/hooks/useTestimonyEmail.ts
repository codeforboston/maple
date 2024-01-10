import { formatTestimony, formatTestimonyPlaintext } from "components/testimony"
import { useProfile } from "../../db"
import { formatBillId } from "../../formatting"
import { maple, siteUrl } from "../../links"
import { positionActions } from "../content"
import { usePublishState } from "./usePublishState"

/** Generates the email sent to legislators. */
export const useTestimonyEmail = () => {
  const { share, position, bill, content, authorUid } = usePublishState()
  const { profile } = useProfile()

  const to = share.recipients
      .map(r => `${r.Name} <${r.EmailAddress}>`)
      .join(";"),
    billId = formatBillId(bill?.id!),
    intro = `As your constituent, I am writing to let you know that I ${
      positionActions[position!]
    } bill ${billId}: "${bill?.content.Title.trim()}".`,
    testimonyUrl =
      authorUid &&
      bill &&
      siteUrl(
        maple.userTestimony({ authorUid, billId: bill.id, court: bill.court })
      ),
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

  const htmlBody = formatTestimony(markdownBody).__html

  const mailToUrl = `mailto:${to}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(markdownBody)}`

  if (profile) {
    return { ready: true, mailToUrl, body: htmlBody, to } as const
  } else {
    return { ready: false } as const
  }
}
