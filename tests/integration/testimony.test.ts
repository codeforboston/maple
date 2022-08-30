import { User } from "firebase/auth"
import { doc, getDoc, setDoc, Timestamp, updateDoc } from "firebase/firestore"
import { httpsCallable } from "firebase/functions"
import { ref, uploadBytes } from "firebase/storage"
import { nanoid } from "nanoid"
import { firestore, functions, storage } from "../../components/firebase"
import { terminateFirebase, testDb, testStorage } from "../testUtils"
import {
  createFakeBill,
  expectPermissionDenied,
  expectStorageUnauthorized,
  getBill,
  signInUser1,
  signInUser2
} from "./common"

type BaseTestimony = {
  billId: string
  court: number
  position: "endorse" | "oppose" | "neutral"
  content: string
  attachmentId: string | null | undefined
}

type DraftTestimony = BaseTestimony & {
  publishedVersion?: number
}

type Testimony = BaseTestimony & {
  authorUid: string
  authorDisplayName: string
  version: number
  publishedAt: Timestamp
}

const refs = {
  draftTestimony: (uid: string, id: string) =>
    doc(firestore, `/users/${uid}/draftTestimony/${id}`),
  draftAttachment: (uid: string, id: string) =>
    ref(storage, `/users/${uid}/draftAttachments/${id}`),
  publishedAttachment: (id: string) =>
    ref(storage, `/publishedAttachments/${id}`),
  archivedAttachment: (uid: string, id: string) =>
    ref(storage, `/users/${uid}/archivedAttachments/${id}`)
}

const paths = {
  draftTestimony: (uid: string, id: string) =>
    `/users/${uid}/draftTestimony/${id}`,
  draftAttachment: (uid: string, id: string) =>
    `/users/${uid}/draftAttachments/${id}`,
  publishedAttachment: (id: string) => `/publishedAttachments/${id}`,
  archivedAttachment: (uid: string, id: string) =>
    `/users/${uid}/archivedAttachments/${id}`
}

const deleteTestimony = httpsCallable<
  { publicationId: string },
  { deleted: boolean }
>(functions, "deleteTestimony")

const publishTestimony = httpsCallable<
  { draftId: string },
  { publicationId: string }
>(functions, "publishTestimony")

let uid: string
let user: User
beforeEach(async () => {
  user = await signInUser1()
  uid = user.uid
})

let billId: string, draft: DraftTestimony, draftId: string
beforeEach(async () => {
  billId = await createFakeBill()
  ;({ draft, draftId } = await createDraft(uid, billId))
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
  describe("attachments", () => {
    it("creates draft attachments", async () => {
      await uploadBytes(refs.draftAttachment(uid, "test"), new Uint8Array(10), {
        contentType: "application/pdf"
      })
    })
    it("denies non-pdf attachments", async () => {
      await expectStorageUnauthorized(
        uploadBytes(refs.draftAttachment(uid, "test"), new Uint8Array(10), {
          contentType: "image/png"
        })
      )
    })
    it("denies large pdfs", async () => {
      const overLimitBytes = 15e6
      await expectStorageUnauthorized(
        uploadBytes(
          refs.draftAttachment(uid, "test"),
          new Uint8Array(overLimitBytes),
          { contentType: "application/pdf" }
        )
      )
    })
  })
})

describe("publishTestimony", () => {
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

  it("Publishes testimony on scraped bills", async () => {
    const { draftId } = await createDraft(uid, "H1")
    const res = await publishTestimony({ draftId })
    const publication = await getPublication(uid, res.data.publicationId)
    expect(publication).toBeDefined()
  })

  it("Publishes new testimony", async () => {
    const res = await publishTestimony({ draftId }),
      publicationId = res.data.publicationId

    expect(publicationId).toBeDefined()

    const publication = await getPublication(uid, publicationId)

    expect(publication).toBeDefined()
    expect(publication?.version).toBe(1)
    expect(publication.publishedAt).toBeDefined()
    expect(publication.authorUid).toEqual(user.uid)
    expect(publication.authorDisplayName).toEqual(user.displayName)
    expect(publication).toMatchObject(draft)

    draft = await getDraft(uid, draftId)
    expect(draft.publishedVersion).toBe(1)
  })

  it("Updates bill metadata on publish", async () => {
    const res = await publishTestimony({ draftId })
    const bill = await getBill(billId)
    const published = await getPublication(uid, res.data.publicationId)

    expect(bill.testimonyCount).toBe(1)
    expect(bill.endorseCount).toBe(1)
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

    let bill = await getBill(billId)
    expect(bill.testimonyCount).toBe(1)
    expect(bill.endorseCount).toBe(1)

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

    bill = await getBill(billId)
    expect(bill.testimonyCount).toBe(1)
    expect(bill.endorseCount).toBe(1)
  })

  it("Supports multiple users", async () => {
    const res1 = await publishTestimony({ draftId })

    const { uid: uid2 } = await signInUser2()
    await createDraft(uid2, billId)
    const res2 = await publishTestimony({ draftId })

    let bill = await getBill(billId)
    expect(bill.testimonyCount).toBe(2)
    expect(bill.endorseCount).toBe(2)
    expect(bill.latestTestimonyId).toBe(res2.data.publicationId)

    await deleteTestimony({ publicationId: res2.data.publicationId })

    bill = await getBill(billId)
    expect(bill.testimonyCount).toBe(1)
    expect(bill.endorseCount).toBe(1)
    expect(bill.latestTestimonyId).toBe(res1.data.publicationId)
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

  describe("attachments", () => {
    it("copies drafts to published and archived files", async () => {
      const attachmentId = nanoid()
      await createDraftAttachment(uid, attachmentId, "test-pdf")
      await updateDoc(refs.draftTestimony(uid, draftId), { attachmentId })

      const res = await publishTestimony({ draftId }),
        { publication, attachments } = await getPublicationAndAttachments(
          uid,
          res.data.publicationId
        ),
        publishedAttachmentId = (publication as any).attachmentId

      expect(publishedAttachmentId).toBeTruthy()
      expect(attachments.archived!.toString()).toBe("test-pdf")
      expect(attachments.published!.toString()).toBe("test-pdf")
    })

    it("updates published attachments if draft is updated", async () => {
      // Publish 1
      let attachmentId = nanoid()
      await createDraftAttachment(uid, attachmentId, "test-pdf-1")
      await updateDoc(refs.draftTestimony(uid, draftId), { attachmentId })
      const r1 = await publishTestimony({ draftId })
      const p1 = await getPublication(uid, r1.data.publicationId)

      // Publish 2
      attachmentId = nanoid()
      const expectedContent = "test-pdf-2"
      await createDraftAttachment(uid, attachmentId, "test-pdf-2")
      await updateDoc(refs.draftTestimony(uid, draftId), { attachmentId })
      const r = await publishTestimony({ draftId })

      const { attachments } = await getPublicationAndAttachments(
        uid,
        r.data.publicationId
      )

      await expect(
        fileExists(paths.publishedAttachment(p1.attachmentId!))
      ).resolves.toBeFalsy()
      expect(attachments.archived!.toString()).toBe(expectedContent)
      expect(attachments.published!.toString()).toBe(expectedContent)
    })

    it("does nothing if draft attachment is unchanged", async () => {
      // Publish 1
      let attachmentId = nanoid()
      const expectedContent = "test-pdf-1"
      await createDraftAttachment(uid, attachmentId, expectedContent)
      await updateDoc(refs.draftTestimony(uid, draftId), { attachmentId })
      let r = await publishTestimony({ draftId })
      const publication = await getPublication(uid, r.data.publicationId)

      // Publish 2
      r = await publishTestimony({ draftId })
      const { attachments, publication: publication2 } =
        await getPublicationAndAttachments(uid, r.data.publicationId)

      expect(publication.attachmentId).toBeTruthy()
      expect(publication.attachmentId).toEqual(publication2.attachmentId)
      expect(attachments.published!.toString()).toEqual(expectedContent)
    })

    it("deletes published attachment if draft is deleted", async () => {
      // Publish 1
      let attachmentId = nanoid()
      const expectedContent = "test-pdf-1"
      await createDraftAttachment(uid, attachmentId, expectedContent)
      await updateDoc(refs.draftTestimony(uid, draftId), { attachmentId })
      let r = await publishTestimony({ draftId })
      const publication = await getPublication(uid, r.data.publicationId)

      // Publish 2
      await updateDoc(refs.draftTestimony(uid, draftId), { attachmentId: null })
      r = await publishTestimony({ draftId })
      const { attachments, publication: publication2 } =
        await getPublicationAndAttachments(uid, r.data.publicationId)

      expect(publication.attachmentId).toBeTruthy()
      expect(publication2.attachmentId).toBeFalsy()
      expect(attachments.published).toBeFalsy()
    })
  })
})

describe("deleteTestimony", () => {
  it("Deletes published testimony", async () => {
    let res = await publishTestimony({ draftId })

    await deleteTestimony({ publicationId: res.data.publicationId })

    let testimony = await getPublication(uid, res.data.publicationId)
    const bill = await getBill(billId)
    const draft = await testDb.doc(paths.draftTestimony(uid, draftId)).get()

    expect(testimony).toBeUndefined()
    expect(bill.latestTestimonyAt).toBeUndefined()
    expect(bill.latestTestimonyId).toBeUndefined()
    expect(bill.testimonyCount).toBe(0)
    expect(bill.endorseCount).toBe(0)
    expect(draft.data()!.publishedVersion).toBeUndefined()
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

  describe("attachments", () => {
    it("deletes attachments", async () => {
      let attachmentId = nanoid()
      await createDraftAttachment(uid, attachmentId, "test-pdf-1")
      await updateDoc(refs.draftTestimony(uid, draftId), { attachmentId })
      const r = await publishTestimony({ draftId })
      const p = await getPublication(uid, r.data.publicationId)

      await deleteTestimony({ publicationId: r.data.publicationId })

      expect(p.attachmentId).toBeDefined()
      await expect(
        fileExists(paths.publishedAttachment(p.attachmentId!))
      ).resolves.toBeFalsy()
    })
  })
})

async function getPublicationAndAttachments(uid: string, id: string) {
  const publication = await getPublication(uid, id),
    publishedAttachmentId = (publication as any).attachmentId

  const attachments: { archived: null | Buffer; published: null | Buffer } = {
    archived: null,
    published: null
  }

  if (publishedAttachmentId) {
    attachments.archived = await getFile(
      paths.archivedAttachment(uid, publishedAttachmentId)
    )
    attachments.published = await getFile(
      paths.publishedAttachment(publishedAttachmentId)
    )
  }

  return { publication, attachments }
}

async function getPublication(uid: string, id: string): Promise<Testimony> {
  const doc = await testDb.doc(`/users/${uid}/publishedTestimony/${id}`).get()
  return doc.data() as any
}

async function getDraft(uid: string, id: string): Promise<DraftTestimony> {
  const doc = await testDb.doc(`/users/${uid}/draftTestimony/${id}`).get()
  return doc.data() as any
}

async function fileExists(path: string) {
  const f = testStorage.bucket().file(path)
  const [exists] = await f.exists()
  return exists
}

async function getFile(path: string): Promise<Buffer> {
  const [r] = await testStorage.bucket().file(path).download()
  return r
}

async function createDraftAttachment(uid: string, id: string, content: string) {
  await uploadBytes(refs.draftAttachment(uid, id), Buffer.from(content), {
    contentType: "application/pdf"
  })
}

async function createDraft(uid: string, billId: string) {
  const draftId = "test-draft-id"
  const draft: DraftTestimony = {
    billId,
    content: "test testimony",
    court: 192,
    position: "endorse",
    attachmentId: null
  }

  await setDoc(refs.draftTestimony(uid, draftId), draft)
  return { draft, draftId }
}
