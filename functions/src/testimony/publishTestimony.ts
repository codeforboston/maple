import { DocumentReference, DocumentSnapshot } from "@google-cloud/firestore"
import { https, logger } from "firebase-functions"
import { Record } from "runtypes"
import { Bill } from "../bills/types"
import { checkAuth, checkRequest, DocUpdate, fail, Id } from "../common"
import { db, Timestamp, auth } from "../firebase"
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
      new PublishTestimonyTransaction(t, draftId, uid).run()
    )
  } catch (e) {
    logger.info("Publication transaction failed.", e)
    throw e
  }

  return { publicationId }
})

class PublishTestimonyTransaction {
  private t
  private draftId
  private uid

  private draftSnap!: DocumentSnapshot
  private draft!: DraftTestimony
  private billSnap!: DocumentSnapshot
  private bill!: Bill
  private publicationRef!: DocumentReference
  private publicationExists!: boolean
  private profile?: any

  constructor(t: FirebaseFirestore.Transaction, draftId: string, uid: string) {
    this.t = t
    this.draftId = draftId
    this.uid = uid
  }

  async run() {
    await this.resolveDraft()
    await this.resolvePublication()
    await this.resolveProfile()

    const newPublication: Testimony = {
      authorUid: this.uid,
      authorDisplayName: await this.getDisplayName(),
      billId: this.draft.billId,
      content: this.draft.content,
      court: this.draft.court,
      position: this.draft.position,
      version: await this.getNextPublicationVersion(),
      publishedAt: Timestamp.now()
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

    return this.publicationRef.id
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
      publishedVersion: newPublication.version
    }
    this.t.update(this.draftSnap.ref, update)
  }

  private updateBill(newPublication: Testimony) {
    const billTestimonyFields: DocUpdate<Bill> = {
      latestTestimonyAt: newPublication.publishedAt,
      latestTestimonyId: this.publicationRef.id
    }
    if (!this.publicationExists) {
      billTestimonyFields.testimonyCount = this.bill.testimonyCount + 1
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

    if (!(await this.isValidCourt(draft.court))) {
      throw fail(
        "failed-precondition",
        `Draft testimony has invalid court number ${draft.court}`
      )
    }

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

  private async isValidCourt(court: number) {
    // TODO: Generate court documents and check for existence of the document
    return court === currentGeneralCourt
    // const doc = await db.doc(`/generalCourts/${court}`).get()
    // return doc.exists
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

    if (archived.size === 0) {
      return 1
    } else {
      const data = archived.docs[0].data()
      return Testimony.checkWithDefaults(data).version + 1
    }
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
      this.publicationExists = false
      this.publicationRef = db
        .collection(`/users/${this.uid}/publishedTestimony`)
        .doc()
    } else {
      this.publicationExists = true
      this.publicationRef = publications.docs[0].ref
    }
  }

  private async getDisplayName() {
    const user = await auth.getUser(this.uid)
    return user.displayName ?? "Anonymous"
  }
}
