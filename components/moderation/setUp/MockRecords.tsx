import { Timestamp } from "firebase/firestore"
import { loremIpsum } from "lorem-ipsum"
import { nanoid } from "nanoid"
import { Report } from "../types"
import { BaseTestimony, Testimony } from "components/db"

export const createFakeTestimonyReport = (uid?: string) => {
  const user = fakeUser(uid)
  const testimony = createMockTestimony("H1002", user.uid)
  const submittedReport = createMockReportSubmission(testimony)
  const report = createMockReportRecord(submittedReport)

  return { user, testimony, submittedReport, report }
}

export const fakeUser = (uid?: string) => ({
  uid: uid ?? "usr" + nanoid(5),
  fullName: loremIpsum({ count: 2, units: "words" }),
  email: `${nanoid(4)}@example.com`,
  password: "password"
})

export type MockReportSubmission = {
  uid: string
  authorUid: string
  testimonyId: string
  reason: string
  additionalInformation?: string
}

export const createMockTestimony = (
  billId: string,
  userId: string
): Testimony => {
  const testimony: Testimony = {
    id: "mock-" + nanoid(8),
    authorUid: userId,
    authorDisplayName: "none",
    authorRole: "user",
    billTitle: "An act" + loremIpsum({ count: 2, units: "words" }),
    version: 2,
    publishedAt: Timestamp.fromDate(new Date()),
    billId: billId ?? "H1002",
    court: 192,
    position: "oppose",
    content: loremIpsum({ count: 5, units: "words" }),
    fullName: "Anonymous"
  }
  return testimony
}

export const createMockReportSubmission = (testimony: Testimony) => {
  const { id: testimonyId, authorUid } = testimony
  return {
    uid: "report-" + nanoid(5),
    authorUid: authorUid,
    testimonyId: testimonyId,
    reason: loremIpsum({ count: 3, units: "words" }),
    additionalInformation: ""
  }
}

export const createMockReportRecord = (
  reportSubmission: MockReportSubmission
) => {
  const { uid, authorUid, testimonyId, reason, additionalInformation } =
    reportSubmission

  const fullReport: Report = {
    id: uid,
    reportId: uid,
    reporterUid: nanoid(8),
    authorUid: authorUid,
    testimonyId: testimonyId,
    testimonyVersion: "2",
    reportDate: Timestamp.fromDate(new Date()),
    reason: reason,
    additionalInformation
  }

  return fullReport
}
