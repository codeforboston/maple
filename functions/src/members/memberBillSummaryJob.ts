import { onSchedule } from "firebase-functions/v2/scheduler"
import {
  MemberBillSummaryInput,
  buildMemberBillSummary
} from "./memberBillSummary"
import { FieldValue, db } from "../firebase"
import { currentGeneralCourt } from "../shared"

export const buildMemberBillSummaries = onSchedule(
  { schedule: "every 24 hours", timeoutSeconds: 540 },
  async () => {
    const court = currentGeneralCourt
    const [memberSnapshot, billSnapshot] = await Promise.all([
      db
        .collection(`/generalCourts/${court}/members`)
        .select("content.SponsoredBills", "content.CoSponsoredBills")
        .get(),
      db
        .collection(`/generalCourts/${court}/bills`)
        .select("content.Title", "topics")
        .get()
    ])

    const bills = billSnapshot.docs
      .map(toBillSummaryInput)
      .filter((bill): bill is MemberBillSummaryInput => bill !== null)
    const writer = db.bulkWriter()

    memberSnapshot.docs.forEach(member => {
      const summary = buildMemberBillSummary(
        getStringArray(member.get("content.SponsoredBills")),
        getStringArray(member.get("content.CoSponsoredBills")),
        bills
      )

      writer.set(
        db.doc(`/generalCourts/${court}/memberBillSummaries/${member.id}`),
        { ...summary, generatedAt: FieldValue.serverTimestamp() }
      )
    })

    await writer.close()
  }
)

function getStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : []
}

function toBillSummaryInput(
  snapshot: FirebaseFirestore.QueryDocumentSnapshot
): MemberBillSummaryInput | null {
  const title = snapshot.get("content.Title")
  if (typeof title !== "string") return null

  const rawTopics: unknown = snapshot.get("topics")
  const topics = Array.isArray(rawTopics)
    ? rawTopics
        .filter(
          (topic): topic is { topic: string } =>
            typeof topic?.topic === "string"
        )
        .map(({ topic }) => ({ topic }))
    : undefined

  return {
    id: snapshot.id,
    content: { Title: title },
    topics
  }
}
