import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc, setDoc, Timestamp, updateDoc } from "firebase/firestore"
import { httpsCallable } from "firebase/functions"
import { auth, firestore, functions } from "../../components/firebase"
import { terminateFirebase, testDb, testTimestamp } from "../testUtils"
import { nanoid } from "nanoid"
import { Bill, BillContent } from "../../components/db"

type BaseTestimony = {
  billId: string
  court: number
  position: "endorse" | "oppose" | "neutral"
  content: string
}

type DraftTestimony = BaseTestimony & {
  publishedVersion?: number
}

type Testimony = BaseTestimony & {
  authorUid: string
  version: number
  publishedAt: Timestamp
}

const refs = {
  draftTestimony: (uid: string, id: string) =>
    doc(firestore, `/users/${uid}/draftTestimony/${id}`)
}

const deleteTestimony = httpsCallable<
  { publicationId: string },
  { status: "ok" }
>(functions, "deleteTestimony")

const publishTestimony = httpsCallable<
  { draftId: string },
  { publicationId: string }
>(functions, "publishTestimony")

let uid: string
beforeEach(async () => {
  uid = (await signInUser1()).uid
})

afterAll(terminateFirebase)

describe("draftTestimony", () => {
  it("creates draft documents", async () => {
    await setDoc(refs.draftTestimony(uid, "test"), {})
  })
  it("denies unauthorized access", async () => {
    await expectPermissionDenied(
      setDoc(refs.draftTestimony("someone else", "test"), {})
    )
  })
})

describe("publishTestimony", () => {
  let billId: string, draft: DraftTestimony, draftId: string
  beforeEach(async () => {
    billId = await createFakeBill()
    ;({ draft, draftId } = await createDraft(uid, billId))
  })

  it("Fails if draft doesn't exist", async () => {
    await expect(
      publishTestimony({ draftId: "nonexistant-id" })
    ).rejects.toThrow("No draft found with id")
  })

  it("Fails if draft is invalid", async () => {
    await updateDoc(refs.draftTestimony(uid, draftId), {
      content: "",
      position: "asdfasdf"
    })
    await expect(publishTestimony({ draftId })).rejects.toThrow(
      "failed validation"
    )
  })

  it("Publishes new testimony", async () => {
    const res = await publishTestimony({ draftId }),
      publicationId = res.data.publicationId

    expect(publicationId).toBeDefined()

    const publication = await getPublication(uid, publicationId)

    expect(publication).toBeDefined()
    expect(publication?.version).toBe(1)
    expect(publication.publishedAt).toBeDefined()
    expect(publication).toMatchObject(draft)

    draft = await getDraft(uid, draftId)
    expect(draft.publishedVersion).toBe(1)
  })

  it("Updates bill metadata on publish", async () => {
    const res = await publishTestimony({ draftId })
    const bill = await getBill(billId)
    const published = await getPublication(uid, res.data.publicationId)

    expect(bill.testimonyCount).toBe(1)
    expect(bill.latestTestimonyId).toBe(res.data.publicationId)
    expect(bill.latestTestimonyAt).toEqual(published.publishedAt)
  })

  it("Archives testimony on publish", async () => {
    const res = await publishTestimony({ draftId })

    const archived = await testDb
        .collection(`/users/${uid}/archivedTestimony`)
        .where("billId", "==", billId)
        .get(),
      published = await getPublication(uid, res.data.publicationId)

    expect(archived.size).toEqual(1)
    expect(archived.docs[0].data()).toMatchObject(published)
  })

  it("Updates existing testimony", async () => {
    const res1 = await publishTestimony({ draftId })

    const updatedDraft: DraftTestimony = {
      ...draft,
      content: "updated content"
    }
    await setDoc(refs.draftTestimony(uid, draftId), updatedDraft)

    const res = await publishTestimony({ draftId }),
      published = await getPublication(uid, res.data.publicationId),
      { publishedVersion: draftPublishedVersion } = await getDraft(uid, draftId)

    expect(res1.data.publicationId).toBe(res.data.publicationId)
    expect(published.version).toBe(2)
    expect(published.content).toBe(updatedDraft.content)
    expect(draftPublishedVersion).toBe(2)
  })

  it("Deletes published testimony", async () => {
    let res = await publishTestimony({ draftId })

    await deleteTestimony({ publicationId: res.data.publicationId })

    let testimony = await getPublication(uid, res.data.publicationId)
    const bill = await getBill(billId)

    expect(testimony).toBeUndefined()
    expect(bill.latestTestimonyAt).toBeUndefined()
    expect(bill.latestTestimonyId).toBeUndefined()
    expect(bill.testimonyCount).toBe(0)
  })

  it("Supports multiple users", async () => {
    const res1 = await publishTestimony({ draftId })

    const { uid: uid2 } = await signInUser2()
    await createDraft(uid2, billId)
    const res2 = await publishTestimony({ draftId })

    let bill = await getBill(billId)
    expect(bill.testimonyCount).toBe(2)
    expect(bill.latestTestimonyId).toBe(res2.data.publicationId)

    await deleteTestimony({ publicationId: res2.data.publicationId })

    bill = await getBill(billId)
    expect(bill.testimonyCount).toBe(1)
    expect(bill.latestTestimonyId).toBe(res1.data.publicationId)
  })

  it("Retains archives", async () => {
    const res1 = await publishTestimony({ draftId })
    await deleteTestimony({ publicationId: res1.data.publicationId })

    const res2 = await publishTestimony({ draftId }),
      published = await getPublication(uid, res2.data.publicationId)
    expect(published.version).toBe(2)

    const archived = await testDb
      .collection(`/users/${uid}/archivedTestimony`)
      .where("billId", "==", billId)
      .get()

    expect(archived.size).toBe(2)
  })

  it("denies unauthorized access", async () => {
    await expectPermissionDenied(
      setDoc(doc(firestore, `/users/${uid}/publishedTestimony/test-id`), {})
    )

    await expectPermissionDenied(
      setDoc(doc(firestore, `/users/${uid}/archivedTestimony/test-id`), {})
    )

    await expectPermissionDenied(
      getDoc(doc(firestore, `/users/${uid}/archivedTestimony/test-id`))
    )
  })
})

async function expectPermissionDenied(work: Promise<any>) {
  const warn = console.warn
  console.warn = jest.fn()
  const e = await work
    .then(() => fail("expected promise to reject"))
    .catch(e => e)
  expect(e.code).toBe("permission-denied")
  console.warn = warn
}

async function getPublication(uid: string, id: string): Promise<Testimony> {
  const doc = await testDb.doc(`/users/${uid}/publishedTestimony/${id}`).get()
  return doc.data() as any
}

async function getDraft(uid: string, id: string): Promise<DraftTestimony> {
  const doc = await testDb.doc(`/users/${uid}/draftTestimony/${id}`).get()
  return doc.data() as any
}

async function getBill(id: string): Promise<Bill> {
  const doc = await testDb.doc(`/generalCourts/192/bills/${id}`).get()
  return doc.data() as any
}

async function createFakeBill() {
  const billId = nanoid()
  const bill = {
    content: "fake" as any as BillContent,
    cosponsorCount: 0,
    fetchedAt: testTimestamp.now(),
    id: billId,
    testimonyCount: 0
  }
  await testDb.doc(`/generalCourts/192/bills/${billId}`).create(bill)
  return billId
}

async function createDraft(uid: string, billId: string) {
  const draftId = "test-draft-id"
  const draft: DraftTestimony = {
    billId,
    content: "test testimony",
    court: 192,
    position: "endorse"
  }

  await setDoc(refs.draftTestimony(uid, draftId), draft)
  return { draft, draftId }
}

async function signInUser1() {
  const { user } = await signInWithEmailAndPassword(
    auth,
    "test@example.com",
    "password"
  )
  return user
}

async function signInUser2() {
  const { user } = await signInWithEmailAndPassword(
    auth,
    "test2@example.com",
    "password"
  )
  return user
}
