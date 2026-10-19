import { DocumentSnapshot } from "@google-cloud/firestore"
import { onCall } from "firebase-functions/v2/https"
import type { CallableRequest } from "firebase-functions/v2/https"
import * as logger from "firebase-functions/logger"
import { Record } from "runtypes"
import { BallotQuestion } from "../ballotQuestions/types"
import { Bill } from "../bills/types"
import { Conference, conferenceCountFields } from "../conferences/types"
import {
  checkAuth,
  checkRequest,
  DocUpdate,
  Id,
  Maybe,
  checkAdmin
} from "../common"
import { db, FieldValue } from "../firebase"
import { Attachments } from "./attachments"
import { matchesTestimonyScope } from "./scope"
import { billCountFields, DraftTestimony, Testimony } from "./types"
import { updateTestimonyCounts } from "./updateTestimonyCounts"

const DeleteTestimonyRequest = Record({
  uid: Id,
  publicationId: Id
})

export const deleteTestimonyV2 = onCall(async (request: CallableRequest) => {
  checkAuth(request)

  // Only admins can delete testimony. Previously we used the caller's UID to
  // select the testimony to delete, but admins need to be able to delete other
  // users testimony so we require the uid to be specified in the request.
  checkAdmin(request)

  const { uid, publicationId } = checkRequest(
    DeleteTestimonyRequest,
    request.data
  )

  return performDeleteTestimony(uid, publicationId)
})

export const performDeleteTestimony = async (
  authorUid: string,
  publicationId: string
) => {
  let output: TransactionOutput
  try {
    output = await db.runTransaction(t =>
      new DeleteTestimonyTransaction(t, publicationId, authorUid).run()
    )
  } catch (e) {
    logger.info("Deletion transaction failed.", e)
    throw e
  }

  const attachments = new Attachments()
  await attachments.applyDelete(output.attachmentId)

  return { deleted: output.deleted }
}

type TransactionOutput = { deleted: boolean; attachmentId?: Maybe<string> }
class DeleteTestimonyTransaction {
  private t
  private publicationId
  private uid

  private publicationSnap!: DocumentSnapshot
  private publication!: Testimony
  private billSnap!: DocumentSnapshot
  private bill!: Bill
  private ballotQuestion?: BallotQuestion
  private ballotQuestionRef?: FirebaseFirestore.DocumentReference
  private conference?: Conference
  private conferenceRef?: FirebaseFirestore.DocumentReference
  private draftSnap?: DocumentSnapshot

  constructor(
    t: FirebaseFirestore.Transaction,
    publicationId: string,
    uid: string
  ) {
    this.t = t
    this.publicationId = publicationId
    this.uid = uid
  }

  async run(): Promise<TransactionOutput> {
    await this.loadPublication()
    if (!this.publicationSnap.exists) return { deleted: false }
    await Promise.all([
      this.loadBill(),
      this.loadBallotQuestion(),
      this.loadConference(),
      this.loadDraft()
    ])

    const draftUpdate: DocUpdate<DraftTestimony> = {
      publishedVersion: FieldValue.delete()
    }

    if (matchesTestimonyScope(this.publication)) {
      const billUpdate: DocUpdate<Bill> = {
        ...(await this.resolveNewLatestTestimony()),
        ...updateTestimonyCounts(
          billCountFields,
          this.bill,
          this.publication,
          undefined
        )
      }
      this.t.update(this.billSnap.ref, billUpdate)
    }
    if (this.ballotQuestion && this.ballotQuestionRef) {
      this.t.update(
        this.ballotQuestionRef,
        updateTestimonyCounts(
          billCountFields,
          this.ballotQuestion,
          this.publication,
          undefined
        )
      )
    }
    if (this.conference && this.conferenceRef) {
      this.t.update(
        this.conferenceRef,
        updateTestimonyCounts(
          conferenceCountFields,
          this.conference,
          this.publication,
          undefined
        )
      )
    }
    this.t.delete(this.publicationSnap.ref)
    if (this.draftSnap) this.t.update(this.draftSnap.ref, draftUpdate)

    return {
      deleted: true,
      attachmentId: this.publication.attachmentId
    }
  }

  private async loadPublication() {
    this.publicationSnap = await this.t.get(
      db.doc(`/users/${this.uid}/publishedTestimony/${this.publicationId}`)
    )
    if (this.publicationSnap.exists) {
      this.publication = Testimony.checkWithDefaults(
        this.publicationSnap.data()
      )
    }
  }

  private async loadBill() {
    this.billSnap = await this.t.get(
      db.doc(
        `/generalCourts/${this.publication.court}/bills/${this.publication.billId}`
      )
    )
    this.bill = Bill.checkWithDefaults(this.billSnap.data())
  }

  private async loadDraft() {
    const result = await this.t.get(
      db
        .collection(`users/${this.uid}/draftTestimony`)
        .where("billId", "==", this.publication.billId)
    )
    const drafts = result.docs.filter(d =>
      matchesTestimonyScope(d.data(), this.publication)
    )

    if (drafts.length === 1) {
      this.draftSnap = drafts[0]
    }
  }

  private async loadConference() {
    const conferenceId = this.publication.conferenceId ?? null
    if (!conferenceId) return

    this.conferenceRef = db.doc(
      `/generalCourts/${this.publication.court}/conferences/${conferenceId}`
    )
    const snap = await this.t.get(this.conferenceRef)
    if (!snap.exists) return

    this.conference = Conference.checkWithDefaults(snap.data())
  }

  private async loadBallotQuestion() {
    const ballotQuestionId = this.publication.ballotQuestionId ?? null
    if (!ballotQuestionId) return

    this.ballotQuestionRef = db.doc(`/ballotQuestions/${ballotQuestionId}`)
    const snap = await this.t.get(this.ballotQuestionRef)
    if (!snap.exists) return

    this.ballotQuestion = BallotQuestion.checkWithDefaults(snap.data())
  }

  private findLatest(docs: FirebaseFirestore.QueryDocumentSnapshot[]) {
    return docs.find(
      d => d.id !== this.publicationId && matchesTestimonyScope(d.data())
    )
  }

  /** The bill's latest testimony once this one is gone. Conference testimony
   * shares the bill's id but not its listing, so page past it. */
  private async resolveNewLatestTestimony() {
    const query = db
      .collectionGroup("publishedTestimony")
      .where("billId", "==", this.publication.billId)
      .where("court", "==", this.publication.court)
      .where("ballotQuestionId", "==", null)
      .orderBy("publishedAt", "desc")
    // Two cover the common case: this testimony and the one before it.
    let pageSize = 2
    let page = await this.t.get(query.limit(pageSize))
    let latestDoc = this.findLatest(page.docs)
    while (!latestDoc && page.size === pageSize) {
      const last = page.docs[pageSize - 1]
      pageSize = 10
      page = await this.t.get(query.startAfter(last).limit(pageSize))
      latestDoc = this.findLatest(page.docs)
    }

    if (!latestDoc) {
      return {
        latestTestimonyAt: FieldValue.delete(),
        latestTestimonyId: FieldValue.delete()
      }
    } else {
      const t = Testimony.checkWithDefaults(latestDoc.data())
      return {
        latestTestimonyAt: t.publishedAt,
        latestTestimonyId: latestDoc.id
      }
    }
  }
}
