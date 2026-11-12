import { createdUnlessExists } from "../common"
import { resolveRecipients } from "../email/recipients"
import { db, Timestamp } from "../firebase"
import { LegislatorEmail, LegislatorMail } from "./types"

/** What a record takes from its email. */
type FromEmail = "subject" | "html" | "text" | "createdAt"
type RecordOf<T> = T extends unknown ? Omit<T, FromEmail> : never

/** Queues `email` to the legislators at `addresses` for the send-email
 * extension at /emails/{id}, and records it as sent, unprefixed, at
 * /legislatorMail/{id}. One batch, so neither exists without the other; both
 * are created, so a second call with the same id writes nothing. */
export async function queueLegislatorEmail(
  id: string,
  addresses: string[],
  email: LegislatorEmail,
  record: RecordOf<LegislatorMail>
): Promise<"queued" | "exists" | "noRecipients"> {
  const { to, subjectPrefix } = resolveRecipients(addresses)
  if (!to.length) return "noRecipients"

  const createdAt = Timestamp.now()
  const { subject, text, html } = email.message
  const sent: LegislatorMail = { ...record, subject, html, text, createdAt }
  const batch = db.batch()
  batch.create(db.doc(`/emails/${id}`), {
    ...email,
    to,
    message: { ...email.message, subject: subjectPrefix + subject },
    createdAt
  })
  batch.create(db.doc(`/legislatorMail/${id}`), sent)
  return (await createdUnlessExists(batch.commit())) ? "queued" : "exists"
}
