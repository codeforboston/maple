import { DocumentSnapshot } from "@google-cloud/firestore"
import { onCall } from "firebase-functions/v2/https"
import type { CallableRequest } from "firebase-functions/v2/https"
import * as logger from "firebase-functions/logger"
import { Record } from "runtypes"
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
import { targetCountsUpdate, targetOf } from "./target"
import { DraftTestimony, Testimony } from "./types"

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

  await deleteCosignsOf(publicationId)

  return { deleted: output.deleted }
}

/** Deletes a publication's cosigns, each the way any testimony is deleted.
 * Publish refuses a parent that is gone, so once the parent is deleted no new
 * cosign can appear. This runs even when the parent was already gone, so
 * deleting it again finishes a cascade that stopped partway. */
const deleteCosignsOf = async (publicationId: string) => {
  const cosigns = await db
    .collectionGroup("publishedTestimony")
    .where("cosignOfId", "==", publicationId)
    .select()
    .get()
  for (const cosign of cosigns.docs) {
    await performDeleteTestimony(cosign.ref.parent.parent!.id, cosign.id)
  }
}

type TransactionOutput = { deleted: boolean; attachmentId?: Maybe<string> }
class DeleteTestimonyTransaction {
  private t
  private publicationId
  private uid

  private publicationSnap!: DocumentSnapshot
  private publication!: Testimony
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
    const target = targetOf(this.publication)
    const [targetSnap, latest] = await Promise.all([
      this.t.get(target.ref),
      target.kind === "bill" ? this.resolveNewLatestTestimony() : {},
      this.loadDraft()
    ])

    const draftUpdate: DocUpdate<DraftTestimony> = {
      publishedVersion: FieldValue.delete()
    }

    // A target that is gone (a removed ballot question, say) has no counts.
    if (targetSnap.exists) {
      this.t.update(target.ref, {
        ...latest,
        ...targetCountsUpdate(
          target,
          targetSnap.data(),
          this.publication,
          undefined
        )
      })
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

  private async loadDraft() {
    const result = await this.t.get(
      db
        .collection(`users/${this.uid}/draftTestimony`)
        .where("billId", "==", this.publication.billId)
        .where(
          "ballotQuestionId",
          "==",
          this.publication.ballotQuestionId ?? null
        )
        .where("conferenceId", "==", this.publication.conferenceId ?? null)
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
        .where("ballotQuestionId", "==", null)
        .where("conferenceId", "==", null)
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
