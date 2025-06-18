import { DocumentSnapshot } from "@google-cloud/firestore"
import { https, logger } from "firebase-functions"
import { Record } from "runtypes"
import { Bill } from "../bills/types"
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
import { DraftTestimony, Testimony } from "../../../common/testimony/types"
import { updateTestimonyCounts } from "./updateTestimonyCounts"

const DeleteTestimonyRequest = Record({
  uid: Id,
  publicationId: Id
})

export const deleteTestimony = https.onCall(async (data, context) => {
  checkAuth(context)

  // Only admins can delete testimony. Previously we used the caller's UID to
  // select the testimony to delete, but admins need to be able to delete other
  // users testimony so we require the uid to be specified in the request.
  checkAdmin(context)

  const { uid, publicationId } = checkRequest(DeleteTestimonyRequest, data)

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
    await this.loadBill()
    await this.loadDraft()

    const billUpdate: DocUpdate<Bill> = {
      ...(await this.resolveNewLatestTestimony()),
      ...updateTestimonyCounts(this.bill, this.publication, undefined)
    }

    const draftUpdate: DocUpdate<DraftTestimony> = {
      publishedVersion: FieldValue.delete()
    }

    this.t.update(this.billSnap.ref, billUpdate)
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

    if (result.docs.length === 1) {
      this.draftSnap = result.docs[0]
    }
  }

  private async resolveNewLatestTestimony() {
    const result = await this.t.get(
      db
        .collectionGroup("publishedTestimony")
        .where("billId", "==", this.publication.billId)
        .where("court", "==", this.publication.court)
        .orderBy("publishedAt", "desc")
        .limit(2)
    )
    const latestDoc = result.docs.find(d => d.id !== this.publicationId)

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
