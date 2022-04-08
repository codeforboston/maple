import { DocumentSnapshot } from "@google-cloud/firestore"
import { https, logger } from "firebase-functions"
import { Record } from "runtypes"
import { Bill } from "../bills/types"
import { checkAuth, checkRequest, Id, DocUpdate, Maybe } from "../common"
import { db, FieldValue } from "../firebase"
import { Attachments } from "./attachments"
import { Testimony } from "./types"

const DeleteTestimonyRequest = Record({
  publicationId: Id
})

export const deleteTestimony = https.onCall(async (data, context) => {
  const uid = checkAuth(context)
  const { publicationId } = checkRequest(DeleteTestimonyRequest, data)

  let output: TransactionOutput
  try {
    output = await db.runTransaction(t =>
      new DeleteTestimonyTransaction(t, publicationId, uid).run()
    )
  } catch (e) {
    logger.info("Deletion transaction failed.", e)
    throw e
  }

  const attachments = new Attachments()
  await attachments.applyDelete(output.attachmentId)

  return { deleted: output.deleted }
})

type TransactionOutput = { deleted: boolean; attachmentId?: Maybe<string> }
class DeleteTestimonyTransaction {
  private t
  private publicationId
  private uid

  private publicationSnap!: DocumentSnapshot
  private publication!: Testimony
  private billSnap!: DocumentSnapshot
  private bill!: Bill

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

    const billUpdate: DocUpdate<Bill> = {
      ...(await this.resolveNewLatestTestimony()),
      testimonyCount: Math.max(this.bill.testimonyCount - 1, 0)
    }

    this.t.update(this.billSnap.ref, billUpdate)
    this.t.delete(this.publicationSnap.ref)

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
