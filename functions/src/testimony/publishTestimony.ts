import { DocumentReference, DocumentSnapshot } from "@google-cloud/firestore"
import { https, logger } from "firebase-functions"
import { Record } from "runtypes"
import { Bill } from "../bills/types"
import { checkAuth, checkRequest, fail, Id } from "../common"
import { db, Timestamp } from "../firebase"
import { currentGeneralCourt } from "../malegislature"
import { Testimony, DraftTestimony } from "./types"

const PublishTestimonyRequest = Record({
  draftId: Id
})

export const publishTestimony = https.onCall(async (data, context) => {
  const uid = checkAuth(context)
  const { draftId } = checkRequest(PublishTestimonyRequest, data)

  let publicationId: string
  try {
    publicationId = await db.runTransaction(t =>
      new PublishTransaction(t, draftId, uid).run()
    )
  } catch (e) {
    logger.info("Publication transaction failed.", e)
    throw e
  }

  return { publicationId }
})

class PublishTransaction {
  private t
  private draftId
  private uid

  constructor(t: FirebaseFirestore.Transaction, draftId: string, uid: string) {
    this.t = t
    this.draftId = draftId
    this.uid = uid
  }

  async run() {
    const {
        bill,
        draft: { ref: draftRef, value: draft }
      } = await this.resolveDraft(),
      publication = await this.resolvePublication(draft.billId, draft.court),
      newVersion = await this.getNextPublicationVersion(
        draft.billId,
        draft.court
      )

    // Create a new publication from the draft and increment the version
    const newPublication: Testimony = {
      authorUid: this.uid,
      billId: draft.billId,
      content: draft.content,
      court: draft.court,
      position: draft.position,
      version: newVersion,
      publishedAt: Timestamp.now()
    }

    // Replace the current publication with the new version
    this.t.set(publication.ref, newPublication)

    // Mark the draft as published
    this.t.update(draftRef, { publishedVersion: newPublication.version })

    // Add the publication to the archive
    this.t.create(
      db.collection(`/users/${this.uid}/archivedTestimony`).doc(),
      newPublication
    )

    // Update testimony fields on the target bill
    this.updateBill(publication, bill, newPublication)

    return publication.ref.id
  }

  private updateBill(
    publication: ResolvedPublication,
    snap: DocumentSnapshot,
    newPublication: Testimony
  ) {
    const billTestimonyFields: any = {
      latestTestimonyAt: newPublication.publishedAt,
      latestTestimonyId: publication.ref.id
    }
    const bill = Bill.checkWithDefaults(snap.data())
    if (!publication.exists) {
      billTestimonyFields.testimonyCount = bill.testimonyCount + 1
    }
    this.t.update(snap.ref, billTestimonyFields)
  }

  private async resolveDraft(): Promise<{
    bill: DocumentSnapshot
    draft: {
      ref: DocumentReference
      value: DraftTestimony
    }
  }> {
    const ref = db.doc(`/users/${this.uid}/draftTestimony/${this.draftId}`),
      doc = await this.t.get(ref)

    if (!doc.exists) throw fail("not-found", "No draft found with id " + doc.id)

    const testimony = DraftTestimony.validate(doc.data())

    if (!testimony.success)
      throw fail(
        "failed-precondition",
        `Draft testimony failed validation. ${testimony.code}: ${testimony.message}`
      )

    const draft = testimony.value

    if (!(await this.isValidCourt(draft.court))) {
      throw fail(
        "failed-precondition",
        `Draft testimony has invalid court number ${draft.court}`
      )
    }

    const bill = await db
      .doc(`/generalCourts/${draft.court}/bills/${draft.billId}`)
      .get()
    if (!bill.exists) {
      throw fail(
        "failed-precondition",
        `Draft testimony has invalid bill ID ${draft.billId}`
      )
    }

    return { bill, draft: { ref, value: draft } }
  }

  private async isValidCourt(court: number) {
    // TODO: Generate court documents and check for existence of the document
    return court === currentGeneralCourt
    // const doc = await db.doc(`/generalCourts/${court}`).get()
    // return doc.exists
  }

  private async getNextPublicationVersion(billId: string, court: number) {
    const archived = await this.t.get(
      db
        .collection(`/users/${this.uid}/archivedTestimony`)
        .where("billId", "==", billId)
        .where("court", "==", court)
        .orderBy("version", "desc")
        .limit(1)
    )

    if (archived.size === 0) {
      return 1
    } else {
      const data = archived.docs[0].data()
      return Testimony.checkWithDefaults(data).version + 1
    }
  }

  private async resolvePublication(billId: string, court: number) {
    const publications = await this.t.get(
      db
        .collection(`/users/${this.uid}/publishedTestimony`)
        .where("billId", "==", billId)
        .where("court", "==", court)
        .limit(1)
    )

    if (publications.size === 0) {
      return {
        exists: false,
        ref: db.collection(`/users/${this.uid}/publishedTestimony`).doc()
      }
    } else {
      return publications.docs[0]
    }
  }
}

type ResolvedPublication = Awaited<
  ReturnType<InstanceType<typeof PublishTransaction>["resolvePublication"]>
>
