import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot
} from "@google-cloud/firestore"
import { onCall } from "firebase-functions/v2/https"
import type { CallableRequest } from "firebase-functions/v2/https"
import * as logger from "firebase-functions/logger"
import { nanoid } from "nanoid"
import { Record } from "runtypes"
import { Bill } from "../bills/types"
import { Conference } from "../conferences/types"
import { checkAuth, checkRequest, DocUpdate, fail, Id } from "../common"
import { db, FieldValue, Timestamp } from "../firebase"
import { supportedGeneralCourts, takesTestimony } from "../shared"
import { Attachments, PublishedAttachmentState } from "./attachments"
import { targetCountsUpdate, targetOf, TestimonyTarget } from "./target"
import { DraftTestimony, Testimony } from "./types"

const PublishTestimonyRequest = Record({
  draftId: Id
})

const INITIAL_VERSION = 1,
  MAX_EDITS = 5,
  MAX_VERSION = INITIAL_VERSION + MAX_EDITS

export const publishTestimonyV2 = onCall(async (request: CallableRequest) => {
  const checkEmailVerification = true
  const uid = checkAuth(request, checkEmailVerification)
  const { draftId } = checkRequest(PublishTestimonyRequest, request.data)

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
  updatedAt: Timestamp
}

class PublishTestimonyTransaction {
  private t
  private draftId
  private uid

  private draftSnap!: DocumentSnapshot
  private draft!: DraftTestimony
  private bqId!: string | null
  private bill!: Bill
  private conferenceId!: string | null
  private target!: TestimonyTarget
  private targetData?: DocumentData
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
      fullName: this.profile?.fullName ?? "Anonymous",
      public: this.profile?.public ?? true,
      ballotQuestionId: this.bqId,
      conferenceId: this.conferenceId
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
    this.updateTarget(newPublication)

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

  private updateTarget(newPublication: Testimony) {
    const latest: DocUpdate<Bill> =
      this.target.kind === "bill"
        ? {
            latestTestimonyAt: newPublication.publishedAt,
            latestTestimonyId: this.publicationRef.id
          }
        : {}
    this.t.update(this.target.ref, {
      ...latest,
      ...targetCountsUpdate(
        this.target,
        this.targetData,
        this.currentPublication,
        newPublication
      )
    })
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

    const bqId = draft.ballotQuestionId ?? null
    const conferenceId = draft.conferenceId ?? null
    const target = targetOf(draft)
    const billRef = db.doc(
      `/generalCourts/${draft.court}/bills/${draft.billId}`
    )
    const [billSnap, targetSnap] = await Promise.all([
      this.t.get(billRef),
      target.kind === "bill" ? null : this.t.get(target.ref)
    ])

    if (!billSnap.exists) {
      throw fail(
        "failed-precondition",
        `Draft testimony has invalid bill ID ${draft.billId}`
      )
    }
    if (targetSnap && !targetSnap.exists) {
      throw fail(
        "failed-precondition",
        target.kind === "ballotQuestion"
          ? `Draft testimony has invalid ballotQuestionId ${bqId}`
          : `Draft testimony has invalid conferenceId ${conferenceId}`
      )
    }

    if (target.kind === "conference") {
      const conference = Conference.checkWithDefaults(targetSnap!.data())
      if (conference.canonicalBillId !== draft.billId) {
        throw fail(
          "failed-precondition",
          `Conference ${conferenceId} takes testimony on ${conference.canonicalBillId}, not ${draft.billId}`
        )
      }
      if (!takesTestimony(conference.status)) {
        throw fail(
          "failed-precondition",
          `Conference ${conferenceId} is not accepting testimony (status ${conference.status})`
        )
      }
    }

    this.draft = draft
    this.bqId = bqId
    this.conferenceId = conferenceId
    this.target = target
    this.targetData = (targetSnap ?? billSnap).data()
    this.draftSnap = draftSnap
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

    const info: PublishInfo = {
      version,
      publishedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }

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
        .where("ballotQuestionId", "==", this.bqId)
        .where("conferenceId", "==", this.conferenceId)
        .orderBy("version", "desc")
        .limit(1)
    )
    const latest = archived.docs[0]

    if (!latest) return INITIAL_VERSION

    const nextVersion = Testimony.checkWithDefaults(latest.data()).version + 1

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
        .where("ballotQuestionId", "==", this.bqId)
        .where("conferenceId", "==", this.conferenceId)
        .limit(1)
    )
    const publication = publications.docs[0]

    if (!publication) {
      this.publicationRef = db.doc(
        `/users/${this.uid}/publishedTestimony/${nanoid()}`
      )
    } else {
      this.currentPublication = Testimony.checkWithDefaults(publication.data())
      this.publicationRef = publication.ref
    }
  }

  private getDisplayName(): string {
    // Check if user has profile and then if they're private
    if (this.profile) {
      return this.profile.public ? this.profile.fullName : "private"
    } else {
      return "Anonymous"
    }
  }
}
