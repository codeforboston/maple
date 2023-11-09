import { DocumentReference, DocumentSnapshot } from "@google-cloud/firestore"
import { https, logger } from "firebase-functions"
import { nanoid } from "nanoid"
import { Record } from "runtypes"
import { Bill } from "../bills/types"
import { checkAuth, checkRequest, DocUpdate, fail, Id } from "../common"
import { db, FieldValue, Timestamp } from "../firebase"
import { supportedGeneralCourts } from "../shared"
import { Attachments, PublishedAttachmentState } from "./attachments"
import { DraftTestimony, Testimony } from "./types"
import { updateTestimonyCounts } from "./updateTestimonyCounts"

const PublishTestimonyRequest = Record({
  draftId: Id
})

const INITIAL_VERSION = 1,
  MAX_EDITS = 5,
  MAX_VERSION = INITIAL_VERSION + MAX_EDITS

export const publishTestimony = https.onCall(async (data, context) => {
  const checkEmailVerification = true
  const uid = checkAuth(context, checkEmailVerification)
  const { draftId } = checkRequest(PublishTestimonyRequest, data)

  let output: TransactionOutput
  try {
    output = await db.runTransaction(t =>
      new PublishTestimonyTransaction(t, draftId, uid).run()
    )
  } catch (e) {
    logger.info("Publication transaction failed.", e)
    throw e
  }

  let attachments = new Attachments()
  await attachments.applyPublish(output.attachments)

  return { publicationId: output.publicationId }
})

type TransactionOutput = {
  publicationId: string
  attachments: PublishedAttachmentState
}

type PublishInfo = {
  version: number
  editReason?: string
  publishedAt: Timestamp
}

class PublishTestimonyTransaction {
  private t
  private draftId
  private uid

  private draftSnap!: DocumentSnapshot
  private draft!: DraftTestimony
  private billSnap!: DocumentSnapshot
  private bill!: Bill
  private publicationRef!: DocumentReference
  private currentPublication?: Testimony
  private profile?: any
  private attachments!: PublishedAttachmentState

  constructor(t: FirebaseFirestore.Transaction, draftId: string, uid: string) {
    this.t = t
    this.draftId = draftId
    this.uid = uid
  }

  async run() {
    await this.resolveDraft()
    await this.resolvePublication()
    await this.resolveProfile()
    await this.resolveAttachments()

    const publishInfo = await this.getPublishInfo()

    const newPublication: Testimony = {
      id: this.publicationRef.id,
      authorUid: this.uid,
      authorDisplayName: this.getDisplayName(),
      authorRole: this.profile?.role ?? "user",
      billId: this.draft.billId,
      billTitle: this.bill.content.Title,
      content: this.draft.content,
      court: this.draft.court,
      position: this.draft.position,
      ...publishInfo,
      attachmentId: this.attachments.id,
      draftAttachmentId: this.attachments.draftId,
      fullName: this.profile?.fullName ?? "Anonymous"
    }
    if (this.profile?.representative?.id) {
      newPublication.representativeId = this.profile.representative.id
    }
    if (this.profile?.senator?.id) {
      newPublication.senatorId = this.profile.senator.id
    }
    if (this.profile?.senatorDistrict) {
      newPublication.senatorDistrict = this.profile.senator.district
    }
    if (this.profile?.representativeDistrict) {
      newPublication.representativeDistrict =
        this.profile.representative.district
    }

    this.setPublication(newPublication)
    this.createArchive(newPublication)
    this.updateDraft(newPublication)
    this.updateBill(newPublication)

    return {
      publicationId: this.publicationRef.id,
      attachments: this.attachments
    }
  }

  private setPublication(newPublication: Testimony) {
    this.t.set(this.publicationRef, newPublication)
  }

  private createArchive(newPublication: Testimony) {
    this.t.create(
      db.collection(`/users/${this.uid}/archivedTestimony`).doc(),
      newPublication
    )
  }

  private updateDraft(newPublication: Testimony) {
    const update: DocUpdate<DraftTestimony> = {
      publishedVersion: newPublication.version,
      // Remove the edit reason to clear the form for the next edit.
      editReason: FieldValue.delete()
    }
    this.t.update(this.draftSnap.ref, update)
  }

  private updateBill(newPublication: Testimony) {
    const billTestimonyFields: DocUpdate<Bill> = {
      latestTestimonyAt: newPublication.publishedAt,
      latestTestimonyId: this.publicationRef.id,
      ...updateTestimonyCounts(
        this.bill,
        this.currentPublication,
        newPublication
      )
    }
    this.t.update(this.billSnap.ref, billTestimonyFields)
  }

  private async resolveDraft() {
    const ref = db.doc(`/users/${this.uid}/draftTestimony/${this.draftId}`),
      draftSnap = await this.t.get(ref)

    if (!draftSnap.exists)
      throw fail("not-found", "No draft found with id " + draftSnap.id)

    const testimony = DraftTestimony.validate(draftSnap.data())

    if (!testimony.success)
      throw fail(
        "failed-precondition",
        `Draft testimony failed validation. ${testimony.code}: ${testimony.message}`
      )

    const draft = testimony.value

    await this.checkValidCourt(draft.court)

    const billSnap = await db
      .doc(`/generalCourts/${draft.court}/bills/${draft.billId}`)
      .get()
    if (!billSnap.exists) {
      throw fail(
        "failed-precondition",
        `Draft testimony has invalid bill ID ${draft.billId}`
      )
    }

    this.draft = draft
    this.draftSnap = draftSnap
    this.billSnap = billSnap
    this.bill = Bill.checkWithDefaults(billSnap.data())
  }

  private async resolveProfile() {
    const ref = db.doc(`/profiles/${this.uid}`),
      profileSnap = await this.t.get(ref)
    this.profile = profileSnap.data()
  }

  private async resolveAttachments() {
    const attachments = new Attachments()
    this.attachments = await attachments.resolvePublish({
      draft: this.draft,
      publishedId: this.currentPublication?.attachmentId,
      publishedDraftId: this.currentPublication?.draftAttachmentId,
      uid: this.uid,
      profile: this.profile
    })
  }

  private async checkValidCourt(court: number) {
    const valid = supportedGeneralCourts.includes(court)

    if (!valid) {
      throw fail(
        "failed-precondition",
        `Draft testimony has invalid court number ${court}`
      )
    }
  }

  private async getPublishInfo(): Promise<PublishInfo> {
    const version = await this.getNextPublicationVersion(),
      reason = this.draft.editReason

    const info: PublishInfo = { version, publishedAt: Timestamp.now() }

    if (version > 1) {
      if (!reason) throw fail("invalid-argument", "Edit reason is required.")
      info.editReason = reason
    }

    return info
  }

  private async getNextPublicationVersion() {
    const archived = await this.t.get(
      db
        .collection(`/users/${this.uid}/archivedTestimony`)
        .where("billId", "==", this.draft.billId)
        .where("court", "==", this.draft.court)
        .orderBy("version", "desc")
        .limit(1)
    )

    if (archived.size === 0) return INITIAL_VERSION

    const data = archived.docs[0].data(),
      nextVersion = Testimony.checkWithDefaults(data).version + 1

    if (nextVersion > MAX_VERSION)
      throw new Error(
        "Cannot update testimony. Max number of edits reached: " + MAX_EDITS
      )

    return nextVersion
  }

  private async resolvePublication() {
    const publications = await this.t.get(
      db
        .collection(`/users/${this.uid}/publishedTestimony`)
        .where("billId", "==", this.draft.billId)
        .where("court", "==", this.draft.court)
        .limit(1)
    )

    if (publications.size === 0) {
      this.publicationRef = db.doc(
        `/users/${this.uid}/publishedTestimony/${nanoid()}`
      )
    } else {
      const data = publications.docs[0].data()
      this.currentPublication = Testimony.checkWithDefaults(data)
      this.publicationRef = publications.docs[0].ref
    }
  }

  private getDisplayName(): string {
    // Check if user has profile and then if they're private
    if (this.profile) {
      return this.profile.public ? this.profile.fullName : "<private user>"
    } else {
      return "Anonymous"
    }
  }
}
