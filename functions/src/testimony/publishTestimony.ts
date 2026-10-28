import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot
} from "@google-cloud/firestore"
import { onCall } from "firebase-functions/v2/https"
import type { CallableRequest } from "firebase-functions/v2/https"
import * as logger from "firebase-functions/logger"
import { pick } from "lodash"
import { nanoid } from "nanoid"
import { Record } from "runtypes"
import { Bill } from "../bills/types"
import { Conference } from "../conferences/types"
import { checkAuth, checkRequest, DocUpdate, fail, Id } from "../common"
import { db, FieldValue, Timestamp } from "../firebase"
import { supportedGeneralCourts, takesTestimony } from "../shared"
import { Attachments, PublishedAttachmentState } from "./attachments"
import { cosignRefusal } from "./cosign"
import { cosignTallyFields } from "./cosignTally"
import { targetCountsUpdate, targetOf, TestimonyTarget } from "./target"
import { DraftTestimony, RefusalDetails, Testimony } from "./types"

const PublishTestimonyRequest = Record({
  draftId: Id
})

const INITIAL_VERSION = 1,
  MAX_EDITS = 5

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
  private position!: Testimony["position"]
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
    await this.resolveCosign()
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
      position: this.position,
      ...publishInfo,
      attachmentId: this.attachments.id,
      draftAttachmentId: this.attachments.draftId,
      fullName: this.profile?.fullName ?? "Anonymous",
      public: this.profile?.public ?? true,
      ballotQuestionId: this.bqId,
      conferenceId: this.conferenceId,
      cosignOfId: this.draft.cosignOfId ?? null,
      cosignOfAuthorUid: this.draft.cosignOfAuthorUid ?? null
    }
    // Only a first publication knows when that was, so an edit of older
    // testimony that lacks it leaves it missing.
    const firstPublishedAt = this.currentPublication
      ? this.currentPublication.firstPublishedAt
      : publishInfo.publishedAt
    if (firstPublishedAt) newPublication.firstPublishedAt = firstPublishedAt
    if (this.profile?.representative?.id) {
      newPublication.representativeId = this.profile.representative.id
    }
    if (this.profile?.senator?.id) {
      newPublication.senatorId = this.profile.senator.id
    }
    if (this.profile?.senator?.district) {
      newPublication.senatorDistrict = this.profile.senator.district
    }
    if (this.profile?.representative?.district) {
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

  /** The tally of cosigns belongs to the cosigns' trigger, so a new version
   * keeps it. The archive records what the author wrote, without it. */
  private setPublication(newPublication: Testimony) {
    this.t.set(this.publicationRef, {
      ...newPublication,
      ...pick(this.currentPublication, cosignTallyFields)
    })
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
          `Conference ${conferenceId} is not accepting testimony (status ${conference.status})`,
          { refusal: "conferenceClosed" } satisfies RefusalDetails
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

  /** A cosign seconds someone else's testimony on the same conference, and
   * takes its position when first published. It stays a cosign of that
   * testimony, and plain testimony stays plain. */
  private async resolveCosign() {
    const { cosignOfId } = this.draft
    const parent = cosignOfId ? await this.resolveParent() : undefined
    const current = this.currentPublication

    if (current && (current.cosignOfId ?? null) !== (cosignOfId ?? null)) {
      throw fail(
        "failed-precondition",
        current.cosignOfId
          ? `Testimony ${current.id} cosigns ${current.cosignOfId} and stays a cosign of it`
          : `Testimony ${current.id} is not a cosign and cannot become one`
      )
    }

    this.position = parent
      ? current?.position ?? parent.position
      : this.draft.position
  }

  private async resolveParent() {
    const { cosignOfId, cosignOfAuthorUid } = this.draft

    if (!this.conferenceId) {
      throw fail(
        "failed-precondition",
        "Only conference testimony can be cosigned"
      )
    }

    const parentSnap = await this.t.get(
      db.doc(`/users/${cosignOfAuthorUid}/publishedTestimony/${cosignOfId}`)
    )
    if (!parentSnap.exists) {
      throw fail(
        "failed-precondition",
        `Cosigned testimony ${cosignOfId} no longer exists`,
        { refusal: "cosignParentGone" } satisfies RefusalDetails
      )
    }
    const parent = Testimony.checkWithDefaults(parentSnap.data())

    const refusal = cosignRefusal(this.uid, parent)
    if (refusal) throw fail("failed-precondition", refusal)
    if (targetOf(parent).ref.path !== this.target.ref.path) {
      throw fail(
        "failed-precondition",
        `Cosigned testimony ${cosignOfId} is not on conference ${this.conferenceId}`
      )
    }
    return parent
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

    // Versions number every publication on the scope, so one that replaces a
    // deleted publication starts past 1 without being an edit.
    if (this.currentPublication) {
      if (!reason) throw fail("invalid-argument", "Edit reason is required.")
      await this.checkEditsLeft()
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

    return Testimony.checkWithDefaults(latest.data()).version + 1
  }

  /** Counts the edits of this publication, from its archived versions. */
  private async checkEditsLeft() {
    const versions = await this.t.get(
      db
        .collection(`/users/${this.uid}/archivedTestimony`)
        .where("id", "==", this.publicationRef.id)
        .select()
    )
    if (versions.size > MAX_EDITS)
      throw new Error(
        "Cannot update testimony. Max number of edits reached: " + MAX_EDITS
      )
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
