import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where
} from "firebase/firestore"
import { nanoid } from "nanoid"
import { hasLetterOnRecord } from "../../components/db/legislatorMail"
import { firestore } from "../../components/firebase"
import { sendConferenceLetters } from "../../functions/src/conferenceLetters/sendLetters"
import { Timestamp } from "../../functions/src/firebase"
import { testAuth, testDb } from "../testUtils"
import { expectPermissionDenied, signInUser1, signInUser2 } from "./common"

const COURT = 194
const TEST_RECIPIENT = "test-inbox@example.com"
// Events at noon Eastern on the 12th; the job runs the morning after.
const ADDED_AT = new Date("2031-05-12T16:00:00Z")
const NOW = new Date("2031-05-13T13:00:00Z")

const id = () => nanoid().replace(/[^a-zA-Z0-9]/g, "x")

const member = (code: string, email?: string) =>
  testDb.doc(`generalCourts/${COURT}/members/${code}`).set({
    id: code,
    content: {
      Name: `Member ${code}`,
      District: `District ${code}`,
      ...(email ? { EmailAddress: email } : {})
    }
  })

type Seed = {
  verified?: boolean
  rep?: string
  sen?: string
  withdrawn?: boolean
  replyTo?: string
}

type Input = { uid: string; testimonyId: string; conferenceId: string }

/** An event saying the reader posted or edited their input, to `version`, at
 * `at`. */
const event = async (
  input: Input,
  change: "added" | "edited",
  version: number,
  at: Date
) => {
  const eventId = id()
  const state = (version: number) => ({
    position: "passSomething",
    group: "individual",
    version
  })
  await testDb.doc(`conferenceInputEvents/${eventId}`).set({
    court: COURT,
    conferenceId: input.conferenceId,
    testimonyId: input.testimonyId,
    authorUid: input.uid,
    change,
    ...(change === "edited" && { before: state(version - 1) }),
    after: state(version),
    at: Timestamp.fromDate(at)
  })
  return eventId
}

/** A reader who posted conference input yesterday, and the event that says so. */
const seed = async (conferenceId: string, s: Seed = {}) => {
  const uid = id()
  const testimonyId = id()
  await testAuth.createUser({
    uid,
    email: `${uid}@example.com`,
    emailVerified: s.verified ?? true
  })
  if (!s.withdrawn) {
    await testDb.doc(`users/${uid}/publishedTestimony/${testimonyId}`).set({
      conferenceId,
      court: COURT,
      billId: "H9901",
      position: "passSomething",
      content: "Please pass something.",
      authorUid: uid,
      authorDisplayName: "ada",
      fullName: 'Ada "Ace" Lovelace',
      authorRole: "user",
      version: 1,
      ...(s.rep ? { representativeId: s.rep } : {}),
      ...(s.sen ? { senatorId: s.sen } : {})
    })
  }
  await testDb.doc(`users/${uid}/draftTestimony/${id()}`).set({
    conferenceId,
    billId: "H9901",
    court: COURT,
    ...(s.replyTo ? { replyTo: s.replyTo } : {})
  })
  const input = { uid, testimonyId, conferenceId }
  const eventId = await event(input, "added", 1, ADDED_AT)
  return { ...input, eventId }
}

const DAY = 24 * 60 * 60 * 1000
/** The run `days` after the first, and its window's noon. */
const run = (days: number) => new Date(NOW.getTime() + days * DAY)
const noon = (days: number) => new Date(ADDED_AT.getTime() + days * DAY)

/** The reader's input as published now, at `version`. */
const publishVersion = (input: Input, version: number) =>
  testDb
    .doc(`users/${input.uid}/publishedTestimony/${input.testimonyId}`)
    .update({ version })

const email = async (eventId: string) =>
  (await testDb.doc(`emails/letter_${eventId}`).get()).data()
const record = async (eventId: string) =>
  (await testDb.doc(`legislatorMail/letter_${eventId}`).get()).data()
const skip = async (eventId: string) =>
  (await testDb.doc(`conferenceLetterSkips/${eventId}`).get()).data()

let conferenceId: string
const rep = `R${id()}`
const sen = `S${id()}`
const mute = `M${id()}`

beforeAll(async () => {
  process.env.LETTER_TEST_RECIPIENT = TEST_RECIPIENT
  conferenceId = id()
  await testDb.doc(`generalCourts/${COURT}/conferences/${conferenceId}`).set({
    id: conferenceId,
    court: COURT,
    title: "An Act relative to phone-free schools",
    name: "Phone-Free Schools"
  })
  await Promise.all([
    member(rep, "rep@malegislature.gov"),
    member(sen, "sen@malegislature.gov"),
    member(mute)
  ])
})

describe("sendConferenceLetters", () => {
  it("mails a letter once, to the test address, copying the reader", async () => {
    const { eventId, uid, testimonyId } = await seed(conferenceId, {
      rep,
      sen,
      replyTo: "chosen@example.com"
    })
    await sendConferenceLetters(NOW)
    const sent = await email(eventId)
    expect(sent).toMatchObject({
      to: [TEST_RECIPIENT],
      cc: ["chosen@example.com"],
      replyTo: "chosen@example.com",
      from: '"Ada \\"Ace\\" Lovelace via MAPLE" <notifications@mapletestimony.org>'
    })
    expect(sent!.message.subject).toBe(
      `[dev] would have gone to: rep@malegislature.gov, sen@malegislature.gov — Phone-Free Schools: Please pass something`
    )
    expect(sent!.message.html).toContain(`Dear Representative Member ${rep}`)
    expect(sent!.message.html).toContain(
      `https://mapletestimony.org/conferences/${COURT}/${conferenceId}`
    )
    expect(JSON.parse(sent!.headers["X-SMTPAPI"]).category).toEqual([
      "constituent-letters"
    ])

    // The record names the legislators, not the test address, and the
    // subject without the test prefix.
    const sentRecord = await record(eventId)
    expect(sentRecord).toEqual({
      kind: "letter",
      court: COURT,
      memberCodes: [rep, sen],
      subject: "Phone-Free Schools: Please pass something",
      html: sent!.message.html,
      text: sent!.message.text,
      createdAt: sent!.createdAt,
      uid,
      testimonyId,
      version: 1,
      conferenceId,
      updated: false
    })

    const second = await sendConferenceLetters(NOW)
    expect(second).toBe(0)
    expect((await email(eventId))!.createdAt).toEqual(sent!.createdAt)
  })

  it("replies to the reader's own address without an override", async () => {
    const { eventId, uid } = await seed(conferenceId, { rep })
    await sendConferenceLetters(NOW)
    const sent = await email(eventId)
    // The auth emulator lowercases addresses.
    const own = `${uid}@example.com`.toLowerCase()
    expect(sent!.replyTo).toBe(own)
    expect(sent!.cc).toEqual([own])
  })

  it("writes to the legislator who has an address, and only names them", async () => {
    const { eventId } = await seed(conferenceId, { rep, sen: mute })
    await sendConferenceLetters(NOW)
    const sent = await email(eventId)
    expect(sent!.message.subject).toContain("rep@malegislature.gov —")
    expect(sent!.message.html).not.toContain("Senator")
    expect((await record(eventId))!.memberCodes).toEqual([rep])
  })

  it.each<[string, Seed, string]>([
    ["no verified email", { rep, verified: false }, "noVerifiedEmail"],
    ["no rep or senator", {}, "noLegislator"],
    ["no legislator address", { sen: mute }, "noLegislatorEmail"],
    ["withdrawn before the job", { rep, withdrawn: true }, "withdrawn"]
  ])("records %s as skipped, once", async (_, s, reason) => {
    const { eventId } = await seed(conferenceId, s)
    await sendConferenceLetters(NOW)
    expect(await email(eventId)).toBeUndefined()
    expect(await record(eventId)).toBeUndefined()
    expect((await skip(eventId))!.reason).toBe(reason)
  })

  it("mails only the last of two posts of the same input", async () => {
    const first = await seed(conferenceId, { rep })
    const secondId = await event(
      first,
      "added",
      2,
      new Date(ADDED_AT.getTime() + 60_000)
    )
    await sendConferenceLetters(NOW)
    expect(await email(first.eventId)).toBeUndefined()
    expect((await skip(first.eventId))!.reason).toBe("superseded")
    expect(await email(secondId)).toBeDefined()
  })

  it("mails an edit as an update to the letter on record", async () => {
    const posted = await seed(conferenceId, { rep })
    await sendConferenceLetters(run(0))
    expect(await record(posted.eventId)).toMatchObject({ updated: false })

    await publishVersion(posted, 2)
    const editId = await event(posted, "edited", 2, noon(1))
    await sendConferenceLetters(run(1))
    expect((await email(editId))!.message.subject).toMatch(
      /Phone-Free Schools: Please pass something \(updated\)$/
    )
    expect(await record(editId)).toMatchObject({
      subject: "Phone-Free Schools: Please pass something (updated)",
      version: 2,
      updated: true
    })
  })

  it("mails each version once", async () => {
    // Posted the evening before the run, edited the morning after it, before
    // the run read what was posted: the run mails the edit with the post.
    const posted = await seed(conferenceId, { rep })
    await publishVersion(posted, 2)
    await sendConferenceLetters(run(0))
    expect(await record(posted.eventId)).toMatchObject({
      version: 2,
      updated: false
    })

    const editId = await event(posted, "edited", 2, noon(1))
    await sendConferenceLetters(run(1))
    expect(await email(editId)).toBeUndefined()
    expect((await skip(editId))!.reason).toBe("alreadySent")

    await publishVersion(posted, 3)
    const againId = await event(posted, "edited", 3, noon(2))
    await sendConferenceLetters(run(2))
    expect(await record(againId)).toMatchObject({ version: 3, updated: true })
  })

  it("mails an edit to input whose letter was skipped as new", async () => {
    const posted = await seed(conferenceId, { rep, verified: false })
    await sendConferenceLetters(run(0))
    expect((await skip(posted.eventId))!.reason).toBe("noVerifiedEmail")

    await testAuth.updateUser(posted.uid, { emailVerified: true })
    await publishVersion(posted, 2)
    const editId = await event(posted, "edited", 2, noon(1))
    await sendConferenceLetters(run(1))
    expect((await email(editId))!.message.subject).toMatch(
      /Please pass something$/
    )
    expect(await record(editId)).toMatchObject({ updated: false })
  })

  it("mails an input posted and edited the same day once, as new", async () => {
    const first = await seed(conferenceId, { rep })
    const editId = await event(
      first,
      "edited",
      2,
      new Date(ADDED_AT.getTime() + 60_000)
    )
    await sendConferenceLetters(NOW)
    expect((await skip(first.eventId))!.reason).toBe("superseded")
    expect((await email(editId))!.message.subject).toMatch(
      /Please pass something$/
    )
  })
})

describe("legislatorMail", () => {
  it("lets a reader read only the records of their own letters", async () => {
    const reader = await signInUser1()
    const recordId = `letter_${id()}`
    await testDb.doc(`legislatorMail/${recordId}`).set({
      kind: "letter",
      uid: reader.uid
    })
    const ref = doc(firestore, `legislatorMail/${recordId}`)
    expect((await getDoc(ref)).exists()).toBe(true)

    await signInUser2()
    await expectPermissionDenied(getDoc(ref))
  })

  it("tells the reader's preview whether a letter for their input is on record", async () => {
    const reader = await signInUser1()
    const testimonyId = id()
    await testDb.doc(`legislatorMail/letter_${id()}`).set({
      kind: "letter",
      uid: reader.uid,
      testimonyId
    })
    expect(await hasLetterOnRecord(reader.uid, testimonyId)).toBe(true)
    expect(await hasLetterOnRecord(reader.uid, id())).toBe(false)

    const other = await signInUser2()
    expect(await hasLetterOnRecord(other.uid, testimonyId)).toBe(false)
    await expectPermissionDenied(
      getDocs(
        query(
          collection(firestore, "legislatorMail"),
          where("testimonyId", "==", testimonyId)
        )
      )
    )
  })
})
