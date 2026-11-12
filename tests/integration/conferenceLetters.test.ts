import { doc, getDoc } from "firebase/firestore"
import { nanoid } from "nanoid"
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
  change?: "added" | "edited"
}

/** A reader who posted conference input yesterday, and the event that says so. */
const seed = async (conferenceId: string, s: Seed = {}) => {
  const uid = id()
  const testimonyId = id()
  const eventId = id()
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
  await testDb.doc(`conferenceInputEvents/${eventId}`).set({
    court: COURT,
    conferenceId,
    testimonyId,
    authorUid: uid,
    change: s.change ?? "added",
    ...(s.change === "edited" && {
      before: { position: "passNothing", group: "individual", version: 0 }
    }),
    after: { position: "passSomething", group: "individual", version: 1 },
    at: Timestamp.fromDate(ADDED_AT)
  })
  return { uid, eventId, testimonyId }
}

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
    const secondId = id()
    await testDb.doc(`conferenceInputEvents/${secondId}`).set({
      court: COURT,
      conferenceId,
      testimonyId: first.testimonyId,
      authorUid: first.uid,
      change: "added",
      after: { position: "passSomething", group: "individual", version: 2 },
      at: Timestamp.fromDate(new Date(ADDED_AT.getTime() + 60_000))
    })
    await sendConferenceLetters(NOW)
    expect(await email(first.eventId)).toBeUndefined()
    expect((await skip(first.eventId))!.reason).toBe("superseded")
    expect(await email(secondId)).toBeDefined()
  })

  it("mails an edit as an update", async () => {
    const { eventId } = await seed(conferenceId, { rep, change: "edited" })
    await sendConferenceLetters(NOW)
    expect((await email(eventId))!.message.subject).toMatch(
      /Phone-Free Schools: Please pass something \(updated\)$/
    )
    expect(await record(eventId)).toMatchObject({
      subject: "Phone-Free Schools: Please pass something (updated)",
      updated: true
    })
  })

  it("mails an input posted and edited the same day once, as new", async () => {
    const first = await seed(conferenceId, { rep })
    const editId = id()
    await testDb.doc(`conferenceInputEvents/${editId}`).set({
      court: COURT,
      conferenceId,
      testimonyId: first.testimonyId,
      authorUid: first.uid,
      change: "edited",
      before: { position: "passSomething", group: "individual", version: 1 },
      after: { position: "passSomething", group: "individual", version: 2 },
      at: Timestamp.fromDate(new Date(ADDED_AT.getTime() + 60_000))
    })
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
})
