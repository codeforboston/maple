import { waitFor } from "@testing-library/react"
import { currentGeneralCourt } from "functions/src/shared"
import { FieldValue } from "firebase-admin/firestore"
import { signOut, User } from "firebase/auth"
import { doc, getDoc, setDoc, Timestamp, updateDoc } from "firebase/firestore"
import { httpsCallable } from "firebase/functions"
import { ref, uploadBytes } from "firebase/storage"
import { nanoid } from "nanoid"
import { auth, firestore, functions, storage } from "../../components/firebase"
import { terminateFirebase, testDb, testStorage } from "../testUtils"
import { script as backfillTestimonyScope } from "../../scripts/firebase-admin/backfillTestimonyScope"
import { resolveReport } from "components/db"
import {
  createFakeBill,
  createNewReport,
  expectPermissionDenied,
  expectStorageUnauthorized,
  getBill,
  getProfile,
  signInTestAdmin,
  signInUser1,
  signInUser2,
  signInUser3,
  signInUser4
} from "./common"

type BaseTestimony = {
  billId: string
  court: number
  position:
    | "endorse"
    | "oppose"
    | "neutral"
    | "passNothing"
    | "passSomething"
    | "passSenateVersion"
    | "passHouseVersion"
  content: string
  attachmentId: string | null | undefined
  editReason?: string
  ballotQuestionId?: string | null
  conferenceId?: string | null
  cosignOfId?: string | null
  cosignOfAuthorUid?: string | null
}

type DraftTestimony = BaseTestimony & {
  publishedVersion?: number
}

type Testimony = BaseTestimony & {
  authorUid: string
  authorDisplayName: string
  version: number
  publishedAt: Timestamp
  firstPublishedAt?: Timestamp
  cosignCount?: number
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
  { uid: string; publicationId: string },
  { deleted: boolean }
>(functions, "deleteTestimonyV2")

const publishTestimony = httpsCallable<
  { draftId: string },
  { publicationId: string }
>(functions, "publishTestimonyV2")

let uid: string
let user: User
let fullName: string
beforeEach(async () => {
  user = await signInUser1()
  uid = user.uid
  fullName = (await getProfile(user))?.fullName || "Anonymous"
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
    let billId: string = "H1"
    if (process.env.NEXT_PUBLIC_USE_EMULATOR === "true") {
      billId = await createFakeBill()
    }
    const { draftId } = await createDraft(uid, billId, currentGeneralCourt)
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
    expect([fullName, "Anonymous", "private"]).toContain(
      publication.authorDisplayName
    )
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
      content: "updated content",
      editReason: "edit reason"
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

    const { uid: uid2 } = await signInTestAdmin()
    const { draftId: draftId2 } = await createDraft(uid2, billId)

    const res2 = await publishTestimony({ draftId: draftId2 })

    let bill = await getBill(billId)
    expect(bill.testimonyCount).toBe(2)
    expect(bill.endorseCount).toBe(2)
    expect(bill.latestTestimonyId).toBe(res2.data.publicationId)

    await deleteTestimony({ uid: uid2, publicationId: res2.data.publicationId })

    await signOut(auth)

    bill = await getBill(billId)
    expect(bill.testimonyCount).toBe(1)
    expect(bill.endorseCount).toBe(1)
    expect(bill.latestTestimonyId).toBe(res1.data.publicationId)
  })

  it("denies unauthorized access", async () => {
    // users can access their own testimony collections
    expect(
      getDoc(doc(firestore, `/users/${uid}/publishedTestimony/test-id`))
    ).toBeTruthy()
    expect(
      getDoc(doc(firestore, `/users/${uid}/archivedTestimony/test-id`))
    ).toBeTruthy()

    // TODO: verify whether users can write to their published collection, right now this is the case
    expect(
      setDoc(doc(firestore, `/users/${uid}/publishedTestimony/test-id`), {})
    ).toBeTruthy()
    expect(
      setDoc(doc(firestore, `/users/${uid}/archivedTestimony/test-id`), {})
    ).toBeTruthy()

    // other users can't access users testimony collections
    await signInUser2()

    await expectPermissionDenied(
      setDoc(doc(firestore, `/users/${uid}/publishedTestimony/test-id`), {})
    )

    await expectPermissionDenied(
      setDoc(doc(firestore, `/users/${uid}/archivedTestimony/test-id`), {})
    )

    await getDoc(doc(firestore, `/users/${uid}/archivedTestimony/test-id`))
  })

  it("Keeps the first publication time through edits", async () => {
    const { publicationId } = (await publishTestimony({ draftId })).data
    const first = await getPublication(uid, publicationId)
    expect(first.firstPublishedAt).toEqual(first.publishedAt)

    await updateDoc(refs.draftTestimony(uid, draftId), {
      content: "updated content",
      editReason: "edit reason"
    })
    await publishTestimony({ draftId })
    const edited = await getPublication(uid, publicationId)
    expect(edited.publishedAt).not.toEqual(first.publishedAt)
    expect(edited.firstPublishedAt).toEqual(first.firstPublishedAt)
  })

  it("Leaves the first publication time missing on older testimony", async () => {
    const { publicationId } = (await publishTestimony({ draftId })).data
    await testDb
      .doc(`/users/${uid}/publishedTestimony/${publicationId}`)
      .update({ firstPublishedAt: FieldValue.delete() })

    await updateDoc(refs.draftTestimony(uid, draftId), {
      content: "updated content",
      editReason: "edit reason"
    })
    await publishTestimony({ draftId })
    expect(await getPublication(uid, publicationId)).not.toHaveProperty(
      "firstPublishedAt"
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
      await updateDoc(refs.draftTestimony(uid, draftId), {
        attachmentId,
        editReason: "changed attachment"
      })
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
      await updateDoc(refs.draftTestimony(uid, draftId), {
        editReason: "changed"
      })
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
      await updateDoc(refs.draftTestimony(uid, draftId), {
        attachmentId: null,
        editReason: "removed attachment"
      })
      r = await publishTestimony({ draftId })
      const { attachments, publication: publication2 } =
        await getPublicationAndAttachments(uid, r.data.publicationId)

      expect(publication.attachmentId).toBeTruthy()
      expect(publication2.attachmentId).toBeFalsy()
      expect(attachments.published).toBeFalsy()
    })
  })

  describe("ballotQuestionId", () => {
    beforeAll(async () => {
      await testDb.collection("ballotQuestions").doc("bq-test-1").set({
        id: "bq-test-1",
        billId: null,
        court: currentGeneralCourt,
        electionYear: 2026,
        type: "initiative_statute",
        ballotStatus: "expectedOnBallot",
        ballotQuestionNumber: null,
        relatedBillIds: [],
        description: null,
        atAGlance: null,
        fullSummary: null,
        pdfUrl: null,
        title: "Test ballot question"
      })
    })

    afterAll(async () => {
      await testDb.collection("ballotQuestions").doc("bq-test-1").delete()
    })

    it("Copies ballotQuestionId from draft to published testimony", async () => {
      const { draftId } = await createDraft(uid, billId, undefined, "bq-test-1")
      const res = await publishTestimony({ draftId })
      const publication = await getPublication(uid, res.data.publicationId)
      expect(publication.ballotQuestionId).toBe("bq-test-1")
    })

    it("Ballot question testimony does not overwrite existing regular bill testimony", async () => {
      // Publish regular testimony first
      const resA = await publishTestimony({ draftId })
      const publicationIdA = resA.data.publicationId

      // Publish ballot question testimony for same bill
      const { draftId: bqDraftId } = await createDraft(
        uid,
        billId,
        undefined,
        "bq-test-1"
      )
      const resB = await publishTestimony({ draftId: bqDraftId })
      const publicationIdB = resB.data.publicationId

      expect(publicationIdA).not.toBe(publicationIdB)

      const pubA = await getPublication(uid, publicationIdA)
      const pubB = await getPublication(uid, publicationIdB)
      expect(pubA.ballotQuestionId ?? null).toBeNull()
      expect(pubB.ballotQuestionId).toBe("bq-test-1")
    })

    it("Regular bill testimony does not overwrite existing ballot question testimony", async () => {
      // Publish ballot question testimony first
      const { draftId: bqDraftId } = await createDraft(
        uid,
        billId,
        undefined,
        "bq-test-1"
      )
      const resA = await publishTestimony({ draftId: bqDraftId })
      const publicationIdA = resA.data.publicationId

      // Publish regular testimony for same bill
      const resB = await publishTestimony({ draftId })
      const publicationIdB = resB.data.publicationId

      expect(publicationIdA).not.toBe(publicationIdB)

      const pubA = await getPublication(uid, publicationIdA)
      const pubB = await getPublication(uid, publicationIdB)
      expect(pubA.ballotQuestionId).toBe("bq-test-1")
      expect(pubB.ballotQuestionId ?? null).toBeNull()
    })

    it("Refuses testimony on a ballot question and a conference", async () => {
      const { draftId } = await createDraft(uid, billId, undefined, "bq-test-1")
      await updateDoc(refs.draftTestimony(uid, draftId), {
        conferenceId: "data-privacy",
        position: "passNothing"
      })
      await expect(publishTestimony({ draftId })).rejects.toThrow(
        "Testimony targets a ballot question or a conference, not both"
      )
    })

    it("Fails to publish testimony with a non-existent ballotQuestionId", async () => {
      const { draftId: bqDraftId } = await createDraft(
        uid,
        billId,
        undefined,
        "nonexistent-bq"
      )
      await expect(publishTestimony({ draftId: bqDraftId })).rejects.toThrow(
        "invalid ballotQuestionId"
      )
    })

    it("Re-publishing ballot question testimony updates the same doc", async () => {
      const { draftId: bqDraftId } = await createDraft(
        uid,
        billId,
        undefined,
        "bq-test-1"
      )
      const res1 = await publishTestimony({ draftId: bqDraftId })

      await updateDoc(refs.draftTestimony(uid, bqDraftId), {
        content: "updated ballot question content",
        editReason: "update reason"
      })
      const res2 = await publishTestimony({ draftId: bqDraftId })

      expect(res1.data.publicationId).toBe(res2.data.publicationId)
      const publication = await getPublication(uid, res2.data.publicationId)
      expect(publication.version).toBe(2)
      expect(publication.ballotQuestionId).toBe("bq-test-1")
    })
  })

  describe("conferenceId", () => {
    let conferenceId: string
    beforeEach(async () => {
      conferenceId = await createConference(billId)
    })

    it("Counts conference testimony on the conference, not the bill", async () => {
      const { draftId: conferenceDraftId } = await createConferenceDraft(
        uid,
        billId,
        conferenceId,
        "passSenateVersion"
      )
      const res = await publishTestimony({ draftId: conferenceDraftId })

      const publication = await getPublication(uid, res.data.publicationId)
      expect(publication.conferenceId).toBe(conferenceId)
      expect(publication.position).toBe("passSenateVersion")

      const conference = await getConference(conferenceId)
      expect(conference.testimonyCount).toBe(1)
      expect(conference.passSenateVersionCount).toBe(1)

      const bill = await getBill(billId)
      expect(bill.testimonyCount).toBe(0)
      expect(bill.latestTestimonyId).toBeUndefined()
    })

    it("Keeps bill and conference testimony on the same bill apart", async () => {
      const resA = await publishTestimony({ draftId })
      const { draftId: conferenceDraftId } = await createConferenceDraft(
        uid,
        billId,
        conferenceId,
        "passNothing"
      )
      const resB = await publishTestimony({ draftId: conferenceDraftId })
      // Republishing the bill testimony finds its own publication again.
      await updateDoc(refs.draftTestimony(uid, draftId), {
        content: "updated content",
        editReason: "edit reason"
      })
      const resC = await publishTestimony({ draftId })

      expect(resA.data.publicationId).not.toBe(resB.data.publicationId)
      expect(resC.data.publicationId).toBe(resA.data.publicationId)
      expect((await getPublication(uid, resC.data.publicationId)).version).toBe(
        2
      )
      expect((await getPublication(uid, resB.data.publicationId)).version).toBe(
        1
      )

      const bill = await getBill(billId)
      expect(bill.testimonyCount).toBe(1)
      expect(bill.endorseCount).toBe(1)
      expect(bill.latestTestimonyId).toBe(resA.data.publicationId)
    })

    it("Republishes backfilled legacy bill testimony in place", async () => {
      const resA = await publishTestimony({ draftId })
      // Strip the field from everything the bill testimony wrote, as it was
      // before conference testimony existed, then backfill it.
      const legacy = [
        testDb.doc(paths.draftTestimony(uid, draftId)),
        testDb.doc(
          `/users/${uid}/publishedTestimony/${resA.data.publicationId}`
        ),
        ...(
          await testDb
            .collection(`/users/${uid}/archivedTestimony`)
            .where("billId", "==", billId)
            .get()
        ).docs.map(d => d.ref)
      ]
      for (const ref of legacy)
        await ref.update({ conferenceId: FieldValue.delete() })
      await backfillTestimonyScope({
        db: testDb,
        args: { env: "local", argv: [] }
      } as any)

      const { draftId: conferenceDraftId } = await createConferenceDraft(
        uid,
        billId,
        conferenceId,
        "passNothing"
      )
      await publishTestimony({ draftId: conferenceDraftId })
      await updateDoc(refs.draftTestimony(uid, draftId), {
        content: "updated content",
        editReason: "edit reason"
      })
      const resB = await publishTestimony({ draftId })

      expect(resB.data.publicationId).toBe(resA.data.publicationId)
      const publication = await getPublication(uid, resB.data.publicationId)
      expect(publication.version).toBe(2)
      expect(publication.conferenceId).toBeNull()
    })

    it("Moves the conference counts when the stance changes", async () => {
      const { draftId: conferenceDraftId } = await createConferenceDraft(
        uid,
        billId,
        conferenceId,
        "passSenateVersion"
      )
      const res1 = await publishTestimony({ draftId: conferenceDraftId })
      await updateDoc(refs.draftTestimony(uid, conferenceDraftId), {
        position: "passHouseVersion",
        editReason: "changed my mind"
      })
      const res2 = await publishTestimony({ draftId: conferenceDraftId })

      expect(res2.data.publicationId).toBe(res1.data.publicationId)
      const conference = await getConference(conferenceId)
      expect(conference.testimonyCount).toBe(1)
      expect(conference.passSenateVersionCount).toBe(0)
      expect(conference.passHouseVersionCount).toBe(1)
    })

    it("Fails the delete of a publication whose position does not fit its conference", async () => {
      const { draftId: conferenceDraftId } = await createConferenceDraft(
        uid,
        billId,
        conferenceId,
        "passSenateVersion"
      )
      const res = await publishTestimony({ draftId: conferenceDraftId })
      const publicationPath = `/users/${uid}/publishedTestimony/${res.data.publicationId}`
      await testDb.doc(publicationPath).update({ position: "endorse" })

      await signInTestAdmin()
      await expect(
        deleteTestimony({ uid, publicationId: res.data.publicationId })
      ).rejects.toThrow()
      await signOut(auth)

      expect((await testDb.doc(publicationPath).get()).exists).toBe(true)
      const conference = await getConference(conferenceId)
      expect(conference.testimonyCount).toBe(1)
      expect(conference.passSenateVersionCount).toBe(1)
    })

    it("Refuses a bill position on conference testimony", async () => {
      const { draftId: conferenceDraftId } = await createConferenceDraft(
        uid,
        billId,
        conferenceId,
        "endorse"
      )
      await expect(
        publishTestimony({ draftId: conferenceDraftId })
      ).rejects.toThrow("Conference testimony takes a conference position")
    })

    it("Refuses a conference position on bill testimony", async () => {
      await updateDoc(refs.draftTestimony(uid, draftId), {
        position: "passNothing"
      })
      await expect(publishTestimony({ draftId })).rejects.toThrow(
        "Bill testimony takes a bill position"
      )
    })

    it("Refuses a conference that does not exist", async () => {
      const { draftId: conferenceDraftId } = await createConferenceDraft(
        uid,
        billId,
        "nonexistent-conference",
        "passNothing"
      )
      await expect(
        publishTestimony({ draftId: conferenceDraftId })
      ).rejects.toThrow("invalid conferenceId")
    })

    it.each(["reportFiled", "enacted", "dissolved"])(
      "Refuses testimony on a conference that is %s",
      async status => {
        const closedId = await createConference(billId, status)
        const { draftId: conferenceDraftId } = await createConferenceDraft(
          uid,
          billId,
          closedId,
          "passNothing"
        )
        await expect(
          publishTestimony({ draftId: conferenceDraftId })
        ).rejects.toThrow("not accepting testimony")
        expect((await getConference(closedId)).testimonyCount).toBe(0)
      }
    )

    it("Refuses to republish once the conference has closed", async () => {
      const { draftId: conferenceDraftId } = await createConferenceDraft(
        uid,
        billId,
        conferenceId,
        "passNothing"
      )
      await publishTestimony({ draftId: conferenceDraftId })
      await testDb
        .doc(
          `/generalCourts/${currentGeneralCourt}/conferences/${conferenceId}`
        )
        .update({ status: "reportFiled" })
      await updateDoc(refs.draftTestimony(uid, conferenceDraftId), {
        content: "updated content"
      })
      await expect(
        publishTestimony({ draftId: conferenceDraftId })
      ).rejects.toThrow("not accepting testimony")
    })

    it("Refuses testimony on a bill that is not the conference's", async () => {
      const otherBillId = await createFakeBill()
      const { draftId: conferenceDraftId } = await createConferenceDraft(
        uid,
        otherBillId,
        conferenceId,
        "passNothing"
      )
      await expect(
        publishTestimony({ draftId: conferenceDraftId })
      ).rejects.toThrow(`takes testimony on ${billId}`)
    })

    describe("cosign", () => {
      let parentId: string, parentDraftId: string, uid2: string

      // User 1 testifies on the conference, then user 2 signs in.
      beforeEach(async () => {
        ;({ draftId: parentDraftId } = await createConferenceDraft(
          uid,
          billId,
          conferenceId,
          "passSenateVersion"
        ))
        parentId = (await publishTestimony({ draftId: parentDraftId })).data
          .publicationId
        uid2 = (await signInUser2()).uid
      })

      // Triggers keep the tally and delete cosigns, and the emulator runs
      // triggers one at a time, so a wait can sit behind every earlier test's
      // events.
      const triggerTimeout = 60_000
      const waitForTrigger = (check: () => Promise<void>) =>
        waitFor(check, { interval: 100, timeout: 30_000 })

      const cosignOf = () => ({ cosignOfId: parentId, cosignOfAuthorUid: uid })
      const cosign = async (signIn: () => Promise<User>) => {
        const cosigner = (await signIn()).uid
        const { draftId } = await createCosignDraft(
          cosigner,
          billId,
          conferenceId,
          cosignOf()
        )
        const { publicationId } = (await publishTestimony({ draftId })).data
        return {
          uid: cosigner,
          draftId,
          publicationId,
          publication: await getPublication(cosigner, publicationId)
        }
      }

      it("Files a cosign with no note, at its parent's position", async () => {
        const { draftId: cosignDraftId } = await createCosignDraft(
          uid2,
          billId,
          conferenceId,
          cosignOf()
        )
        const res = await publishTestimony({ draftId: cosignDraftId })

        const publication = await getPublication(uid2, res.data.publicationId)
        expect(publication.cosignOfId).toBe(parentId)
        expect(publication.cosignOfAuthorUid).toBe(uid)
        expect(publication.content).toBe("")
        expect(publication.position).toBe("passSenateVersion")

        const conference = await getConference(conferenceId)
        expect(conference.testimonyCount).toBe(2)
        expect(conference.passSenateVersionCount).toBe(2)
        expect(conference.passNothingCount).toBe(0)
      })

      it("Keeps the copied position through edits to the note and the parent", async () => {
        const { draftId: cosignDraftId } = await createCosignDraft(
          uid2,
          billId,
          conferenceId,
          cosignOf()
        )
        const res = await publishTestimony({ draftId: cosignDraftId })

        await testDb
          .doc(`/users/${uid}/publishedTestimony/${parentId}`)
          .update({ position: "passHouseVersion" })
        await updateDoc(refs.draftTestimony(uid2, cosignDraftId), {
          content: "Because it is right",
          position: "passHouseVersion",
          editReason: "Say why"
        })
        await publishTestimony({ draftId: cosignDraftId })

        const publication = await getPublication(uid2, res.data.publicationId)
        expect(publication.content).toBe("Because it is right")
        expect(publication.version).toBe(2)
        expect(publication.position).toBe("passSenateVersion")
      })

      it("Records exactly one cosign on a double submit", async () => {
        const { draftId: cosignDraftId } = await createCosignDraft(
          uid2,
          billId,
          conferenceId,
          cosignOf()
        )
        await Promise.allSettled([
          publishTestimony({ draftId: cosignDraftId }),
          publishTestimony({ draftId: cosignDraftId })
        ])

        const published = await testDb
          .collection(`/users/${uid2}/publishedTestimony`)
          .where("conferenceId", "==", conferenceId)
          .get()
        expect(published.size).toBe(1)
        expect((await getConference(conferenceId)).testimonyCount).toBe(2)
      })

      it("Refuses a cosign of a cosign", async () => {
        const { draftId: cosignDraftId } = await createCosignDraft(
          uid2,
          billId,
          conferenceId,
          cosignOf()
        )
        const cosignId = (await publishTestimony({ draftId: cosignDraftId }))
          .data.publicationId

        await signInUser1()
        const { draftId } = await createCosignDraft(uid, billId, conferenceId, {
          cosignOfId: cosignId,
          cosignOfAuthorUid: uid2
        })
        await expect(publishTestimony({ draftId })).rejects.toThrow(
          "A cosign cannot be cosigned"
        )
      })

      it("Refuses a cosign of your own testimony", async () => {
        await signInUser1()
        const { draftId } = await createCosignDraft(
          uid,
          billId,
          conferenceId,
          cosignOf()
        )
        await expect(publishTestimony({ draftId })).rejects.toThrow(
          "cannot cosign your own testimony"
        )
      })

      it("Refuses a cosign whose parent is gone", async () => {
        const { draftId } = await createCosignDraft(
          uid2,
          billId,
          conferenceId,
          cosignOf()
        )
        await testDb
          .doc(`/users/${uid}/publishedTestimony/${parentId}`)
          .delete()
        await expect(publishTestimony({ draftId })).rejects.toThrow(
          "no longer exists"
        )
      })

      it("Refuses a cosign of testimony on another conference", async () => {
        const otherConferenceId = await createConference(billId)
        const { draftId } = await createCosignDraft(
          uid2,
          billId,
          otherConferenceId,
          cosignOf()
        )
        await expect(publishTestimony({ draftId })).rejects.toThrow(
          `is not on conference ${otherConferenceId}`
        )
      })

      it("Refuses a cosign of bill testimony", async () => {
        const { draftId } = await createDraft(uid2, billId)
        await updateDoc(refs.draftTestimony(uid2, draftId), cosignOf())
        await expect(publishTestimony({ draftId })).rejects.toThrow(
          "Only conference testimony can be cosigned"
        )
      })

      it("Refuses a cosign on a closed conference", async () => {
        const { draftId } = await createCosignDraft(
          uid2,
          billId,
          conferenceId,
          cosignOf()
        )
        await testDb
          .doc(
            `/generalCourts/${currentGeneralCourt}/conferences/${conferenceId}`
          )
          .update({ status: "reportFiled" })
        await expect(publishTestimony({ draftId })).rejects.toThrow(
          "not accepting testimony"
        )
      })

      it("Refuses turning plain testimony into a cosign", async () => {
        const { draftId } = await createConferenceDraft(
          uid2,
          billId,
          conferenceId,
          "passNothing"
        )
        await publishTestimony({ draftId })
        await updateDoc(refs.draftTestimony(uid2, draftId), {
          ...cosignOf(),
          editReason: "Cosign instead"
        })
        await expect(publishTestimony({ draftId })).rejects.toThrow(
          "is not a cosign and cannot become one"
        )
      })

      it("Refuses turning a cosign into plain testimony", async () => {
        const { draftId } = await createCosignDraft(
          uid2,
          billId,
          conferenceId,
          cosignOf()
        )
        await publishTestimony({ draftId })
        await updateDoc(refs.draftTestimony(uid2, draftId), {
          cosignOfId: null,
          cosignOfAuthorUid: null,
          content: "My own words",
          editReason: "Testify instead"
        })
        await expect(publishTestimony({ draftId })).rejects.toThrow(
          `cosigns ${parentId} and stays a cosign of it`
        )
      })

      it("Refuses a cosign moving to another parent", async () => {
        const { draftId } = await createCosignDraft(
          uid2,
          billId,
          conferenceId,
          cosignOf()
        )
        await publishTestimony({ draftId })

        const uid3 = (await signInUser3()).uid
        const { draftId: otherDraftId } = await createConferenceDraft(
          uid3,
          billId,
          conferenceId,
          "passNothing"
        )
        const otherParentId = (
          await publishTestimony({ draftId: otherDraftId })
        ).data.publicationId

        await signInUser2()
        await updateDoc(refs.draftTestimony(uid2, draftId), {
          cosignOfId: otherParentId,
          cosignOfAuthorUid: uid3,
          editReason: "Cosign another"
        })
        await expect(publishTestimony({ draftId })).rejects.toThrow(
          `cosigns ${parentId} and stays a cosign of it`
        )
      })

      it("Refuses an empty note on plain testimony, half a reference and an attachment", async () => {
        const drafts = [
          { content: "" },
          { cosignOfId: parentId },
          { ...cosignOf(), attachmentId: "an-attachment" }
        ]
        for (const fields of drafts) {
          const { draftId } = await createConferenceDraft(
            uid2,
            billId,
            conferenceId,
            "passNothing"
          )
          await updateDoc(refs.draftTestimony(uid2, draftId), fields)
          await expect(publishTestimony({ draftId })).rejects.toThrow(
            "failed validation"
          )
        }
      })

      describe("tally", () => {
        // Cosigners' districts, set on their profiles and restored after.
        let savedProfiles: [ReturnType<typeof testDb.doc>, any][]
        const setDistricts = async (
          uid: string,
          senate?: string,
          house?: string
        ) => {
          const ref = testDb.doc(`/profiles/${uid}`)
          savedProfiles.push([ref, (await ref.get()).data()])
          const member = (district: string) => ({
            id: `member-${district}`,
            name: "A Member",
            district
          })
          await ref.set(
            {
              senator: senate ? member(senate) : FieldValue.delete(),
              representative: house ? member(house) : FieldValue.delete()
            },
            { merge: true }
          )
        }
        beforeEach(() => {
          savedProfiles = []
        })
        afterEach(async () => {
          for (const [ref, profile] of savedProfiles) {
            if (profile) await ref.set(profile)
            else await ref.delete()
          }
        })

        const getParent = () => getPublication(uid, parentId)
        const expectTally = (tally: object) =>
          waitForTrigger(async () =>
            expect(await getParent()).toMatchObject(tally)
          )

        it(
          "Counts cosigns and their distinct districts on the parent",
          async () => {
            await setDistricts(uid2, "First Essex", "3rd Essex")
            const uid3 = (await signInUser3()).uid
            const uid4 = (await signInUser4()).uid
            await setDistricts(uid3, "First Essex", "4th Essex")
            await setDistricts(uid4)

            await cosign(signInUser2)
            await cosign(signInUser3)
            const last = await cosign(signInUser4)

            expect(last.publication.firstPublishedAt).toEqual(
              last.publication.publishedAt
            )
            await expectTally({
              cosignCount: 3,
              cosignSenateDistrictCount: 1,
              cosignHouseDistrictCount: 2,
              lastCosignedAt: last.publication.firstPublishedAt
            })
          },
          triggerTimeout
        )

        it(
          "Doesn't count an edit to a note as a new cosign",
          async () => {
            const first = await cosign(signInUser2)
            await expectTally({ cosignCount: 1 })

            await updateDoc(refs.draftTestimony(uid2, first.draftId), {
              content: "Because it is right",
              editReason: "Say why"
            })
            await publishTestimony({ draftId: first.draftId })

            const second = await cosign(signInUser3)
            await expectTally({
              cosignCount: 2,
              lastCosignedAt: second.publication.firstPublishedAt
            })
          },
          triggerTimeout
        )

        it(
          "Drops a cosign deleted by an admin",
          async () => {
            const first = await cosign(signInUser2)
            const second = await cosign(signInUser3)
            await expectTally({
              cosignCount: 2,
              lastCosignedAt: second.publication.firstPublishedAt
            })

            await signInTestAdmin()
            await deleteTestimony({
              uid: second.uid,
              publicationId: second.publicationId
            })
            await expectTally({
              cosignCount: 1,
              lastCosignedAt: first.publication.firstPublishedAt
            })
          },
          triggerTimeout
        )

        it(
          "Keeps the tally when the parent's author edits",
          async () => {
            await cosign(signInUser2)
            await expectTally({ cosignCount: 1 })

            await signInUser1()
            await updateDoc(refs.draftTestimony(uid, parentDraftId), {
              content: "updated content",
              editReason: "edit reason"
            })
            await publishTestimony({ draftId: parentDraftId })

            const parent = await getParent()
            expect(parent.version).toBe(2)
            expect(parent.cosignCount).toBe(1)
          },
          triggerTimeout
        )

        it("Records the author's districts on any testimony", async () => {
          await setDistricts(uid2, "First Essex", "3rd Essex")
          const { draftId } = await createConferenceDraft(
            uid2,
            billId,
            conferenceId,
            "passNothing"
          )
          const { publicationId } = (await publishTestimony({ draftId })).data
          expect(await getPublication(uid2, publicationId)).toMatchObject({
            senatorDistrict: "First Essex",
            representativeDistrict: "3rd Essex"
          })
        })
      })

      describe("deleting the parent", () => {
        // User 2 and user 3 cosign the parent.
        let cosigns: Awaited<ReturnType<typeof cosign>>[]
        beforeEach(async () => {
          cosigns = [await cosign(signInUser2), await cosign(signInUser3)]
          expect(await getConference(conferenceId)).toMatchObject({
            testimonyCount: 3,
            passSenateVersionCount: 3
          })
          await signInTestAdmin()
        })

        // The counts reach zero with the last cosign's delete.
        const expectCosignsGone = async () => {
          await waitForTrigger(async () =>
            expect(await getConference(conferenceId)).toMatchObject({
              testimonyCount: 0,
              passSenateVersionCount: 0
            })
          )
          for (const c of cosigns) {
            expect(await getPublication(c.uid, c.publicationId)).toBeUndefined()
            const draft = await testDb
              .doc(paths.draftTestimony(c.uid, c.draftId))
              .get()
            expect(draft.data()!.publishedVersion).toBeUndefined()
          }
        }

        it(
          "Deletes its cosigns when an admin deletes it",
          async () => {
            await deleteTestimony({ uid, publicationId: parentId })

            expect(await getPublication(uid, parentId)).toBeUndefined()
            await expectCosignsGone()
          },
          triggerTimeout
        )

        it(
          "Deletes its cosigns when a moderator removes it",
          async () => {
            const { reportId } = await createNewReport(uid, parentId)
            const result = await resolveReport({
              reportId,
              resolution: "remove-testimony",
              reason: "important reason"
            })

            expect(result.data.status).toBe("success")
            expect(await getPublication(uid, parentId)).toBeUndefined()
            await expectCosignsGone()
          },
          triggerTimeout
        )

        it(
          "Resolves a removal whose delete went through without its resolution",
          async () => {
            const { reportId, reportRef } = await createNewReport(uid, parentId)
            await deleteTestimony({ uid, publicationId: parentId })
            await expectCosignsGone()

            const result = await resolveReport({
              reportId,
              resolution: "remove-testimony",
              reason: "important reason"
            })

            expect(result.data.status).toBe("success")
            expect((await reportRef.get()).data()!.resolution).toMatchObject({
              resolution: "remove-testimony",
              authorUid: uid
            })
          },
          triggerTimeout
        )

        it("Leaves the parent and other cosigns when one cosign is deleted", async () => {
          const [first, second] = cosigns
          await deleteTestimony({
            uid: first.uid,
            publicationId: first.publicationId
          })

          expect(await getPublication(uid, parentId)).toBeDefined()
          expect(
            await getPublication(second.uid, second.publicationId)
          ).toBeDefined()
          expect(await getConference(conferenceId)).toMatchObject({
            testimonyCount: 2,
            passSenateVersionCount: 2
          })
        })
      })
    })
  })
})

describe("deleteTestimony", () => {
  async function getSignedInAdmin() {
    const adminUser = await signInTestAdmin()
    const token = await auth.currentUser?.getIdTokenResult()
    expect(token?.claims.role).toEqual("admin")

    return adminUser
  }

  it("Deletes published testimony", async () => {
    const normalUid = uid

    // Publish as user 1
    let res = await publishTestimony({ draftId })

    // Delete as admin
    await getSignedInAdmin()
    const deleted = await deleteTestimony({
      uid: normalUid,
      publicationId: res.data.publicationId
    })

    expect(deleted.data.deleted).toBeTruthy()

    let testimony = await getPublication(normalUid, res.data.publicationId)
    const bill = await getBill(billId)
    const draft = await testDb
      .doc(paths.draftTestimony(normalUid, draftId))
      .get()

    expect(testimony).toBeUndefined()
    expect(bill.latestTestimonyAt).toBeUndefined()
    expect(bill.latestTestimonyId).toBeUndefined()
    expect(bill.testimonyCount).toBe(0)
    expect(bill.endorseCount).toBe(0)
    expect(draft.data()!.publishedVersion).toBeUndefined()
  })

  it("Retains archives", async () => {
    // Publish as user 1
    const res1 = await publishTestimony({ draftId })

    await getSignedInAdmin()
    // Delete as admin
    await deleteTestimony({ uid, publicationId: res1.data.publicationId })

    // Publish again as user 1
    await signInUser1()
    const updatedDraft: DraftTestimony = {
      ...draft,
      content: "updated content",
      editReason: "edit reason"
    }
    await setDoc(refs.draftTestimony(uid, draftId), updatedDraft)
    const res2 = await publishTestimony({ draftId }),
      published = await getPublication(uid, res2.data.publicationId)
    expect(published.version).toBe(2)

    const archived = await testDb
      .collection(`/users/${uid}/archivedTestimony`)
      .where("billId", "==", billId)
      .get()

    expect(archived.size).toBe(2)
  })

  it("Takes conference testimony off the conference's counts", async () => {
    const conferenceId = await createConference(billId)
    const { draftId: conferenceDraftId } = await createConferenceDraft(
      uid,
      billId,
      conferenceId,
      "passSomething"
    )
    const res = await publishTestimony({ draftId: conferenceDraftId })

    await getSignedInAdmin()
    await deleteTestimony({ uid, publicationId: res.data.publicationId })

    const conference = await getConference(conferenceId)
    expect(conference.testimonyCount).toBe(0)
    expect(conference.passSomethingCount).toBe(0)
    const draft = await testDb
      .doc(paths.draftTestimony(uid, conferenceDraftId))
      .get()
    expect(draft.data()!.publishedVersion).toBeUndefined()
  })

  it("Lets conference testimony be deleted after the conference closes", async () => {
    const conferenceId = await createConference(billId)
    const { draftId: conferenceDraftId } = await createConferenceDraft(
      uid,
      billId,
      conferenceId,
      "passSomething"
    )
    const res = await publishTestimony({ draftId: conferenceDraftId })
    await testDb
      .doc(`/generalCourts/${currentGeneralCourt}/conferences/${conferenceId}`)
      .update({ status: "dissolved" })

    await getSignedInAdmin()
    await deleteTestimony({ uid, publicationId: res.data.publicationId })

    expect((await getConference(conferenceId)).testimonyCount).toBe(0)
  })

  it("Never makes conference testimony the bill's latest", async () => {
    const conferenceId = await createConference(billId)
    const resBill = await publishTestimony({ draftId })
    const { draftId: conferenceDraftId } = await createConferenceDraft(
      uid,
      billId,
      conferenceId,
      "passSomething"
    )
    await publishTestimony({ draftId: conferenceDraftId })

    await getSignedInAdmin()
    await deleteTestimony({ uid, publicationId: resBill.data.publicationId })

    const bill = await getBill(billId)
    expect(bill.testimonyCount).toBe(0)
    expect(bill.latestTestimonyId).toBeUndefined()
    expect((await getConference(conferenceId)).testimonyCount).toBe(1)
  })

  it("Skips newer conference testimony for the bill's latest", async () => {
    const resA = await publishTestimony({ draftId })
    const { draftId: conferenceDraftId } = await createConferenceDraft(
      uid,
      billId,
      await createConference(billId),
      "passSomething"
    )
    await publishTestimony({ draftId: conferenceDraftId })
    const { uid: uid2 } = await getSignedInAdmin()
    const { draftId: draftId2 } = await createDraft(uid2, billId)
    const resB = await publishTestimony({ draftId: draftId2 })
    expect((await getBill(billId)).latestTestimonyId).toBe(
      resB.data.publicationId
    )

    await deleteTestimony({ uid: uid2, publicationId: resB.data.publicationId })

    const bill = await getBill(billId)
    expect(bill.testimonyCount).toBe(1)
    expect(bill.latestTestimonyId).toBe(resA.data.publicationId)
  })

  describe("attachments", () => {
    it("deletes attachments", async () => {
      let attachmentId = nanoid()
      await createDraftAttachment(uid, attachmentId, "test-pdf-1")
      await updateDoc(refs.draftTestimony(uid, draftId), { attachmentId })
      const r = await publishTestimony({ draftId })
      const p = await getPublication(uid, r.data.publicationId)

      // Delete as admin
      await getSignedInAdmin()
      await deleteTestimony({ uid, publicationId: r.data.publicationId })

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

/** A conference whose canonical bill is `billId`, with its counts zeroed. It
 * takes testimony only while `status` is appointed. */
async function createConference(billId: string, status = "appointed") {
  const id = `conference-${nanoid()}`.toLowerCase()
  await testDb
    .doc(`/generalCourts/${currentGeneralCourt}/conferences/${id}`)
    .set({
      id,
      court: currentGeneralCourt,
      title: "Test conference",
      senateBillId: billId,
      houseBillId: "H1",
      canonicalBillId: billId,
      conferees: [],
      status,
      hearingIds: [],
      differences: [],
      similarities: [],
      testimonyCount: 0,
      passNothingCount: 0,
      passSomethingCount: 0,
      passSenateVersionCount: 0,
      passHouseVersionCount: 0
    })
  return id
}

async function getConference(id: string) {
  const doc = await testDb
    .doc(`/generalCourts/${currentGeneralCourt}/conferences/${id}`)
    .get()
  return doc.data() as any
}

async function createConferenceDraft(
  uid: string,
  billId: string,
  conferenceId: string,
  position: BaseTestimony["position"]
) {
  const { draftId } = await createDraft(uid, billId)
  await updateDoc(refs.draftTestimony(uid, draftId), {
    conferenceId,
    position
  })
  return { draftId }
}

/** A cosign draft with no note. Its position is the client's guess; the
 * server copies the parent's. */
async function createCosignDraft(
  uid: string,
  billId: string,
  conferenceId: string,
  cosignOf: { cosignOfId: string; cosignOfAuthorUid: string }
) {
  const { draftId } = await createConferenceDraft(
    uid,
    billId,
    conferenceId,
    "passNothing"
  )
  await updateDoc(refs.draftTestimony(uid, draftId), {
    content: "",
    ...cosignOf
  })
  return { draftId }
}

async function createDraft(
  uid: string,
  billId: string,
  court = currentGeneralCourt,
  ballotQuestionId?: string
) {
  const draftId = nanoid()
  const draft: DraftTestimony = {
    billId,
    content: "test testimony",
    court,
    position: "endorse",
    attachmentId: null,
    ballotQuestionId: ballotQuestionId ?? null,
    conferenceId: null
  }

  await setDoc(refs.draftTestimony(uid, draftId), draft)
  return { draft, draftId }
}
