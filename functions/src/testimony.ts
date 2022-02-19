import { DocumentReference } from "@google-cloud/firestore"
import { https, logger } from "firebase-functions"
import {
  Literal as L,
  Number,
  Optional,
  Record as R,
  Runtype,
  Static,
  String as RtString,
  Union
} from "runtypes"
import { db } from "./firebase"
import { currentGeneralCourt } from "./malegislature"

// In particular, reject "/" in ID strings
const simpleId = /^[A-Za-z0-9-_]+$/
const Id = RtString.withConstraint(s => simpleId.test(s))

const maxTestimonyLength = 10_000

const PublishTestimonyRequest = R({
  draftId: Id
})

const DeleteTestimonyRequest = R({
  publicationId: Id
})

const BaseTestimony = R({
  billId: Id,
  court: Number,
  position: Union(L("endorse"), L("oppose"), L("neutral")),
  content: RtString.withConstraint(
    s => s.length > 0 && s.length < maxTestimonyLength
  )
})

type Testimony = Static<typeof Testimony>
const Testimony = BaseTestimony.extend({
  authorUid: Id,
  version: Number
})

type DraftTestimony = Static<typeof DraftTestimony>
const DraftTestimony = BaseTestimony.extend({
  publishedVersion: Optional(Number)
})

/** Parse the request and return the result or fail. */
function checkRequest<A>(type: Runtype<A>, data: any) {
  const validationResult = type.validate(data)
  if (!validationResult.success) {
    throw fail(
      "invalid-argument",
      `${validationResult.code}: ${validationResult.message}`
    )
  }
  return validationResult.value
}

/** Return the authenticated user's id or fail if they are not authenticated. */
function checkAuth(context: https.CallableContext) {
  const uid = context.auth?.uid
  if (!uid) {
    throw fail(
      "unauthenticated",
      "Caller must be signed in to publish testimony"
    )
  }
  return uid
}

export const deleteTestimony = https.onCall(async (data, context) => {
  const uid = checkAuth(context)
  const { publicationId } = checkRequest(DeleteTestimonyRequest, data)

  await db.doc(`/users/${uid}/publishedTestimony/${publicationId}`).delete()

  return { status: "ok" }
})

/**
 * Testimony operations:
 * - update /draftTestimony/{id} on the client. Clear publishedVersion bit.
 * - (re)publish testimony via cloud function. Retrieve currently published
 *   version and current draft, construct publish payload from draft + version,
 *   replace published version, write to archive.
 * - delete testimony. Delete draft and published documents.
 */
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

  return {
    publicationId
  }
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
    const { ref: draftRef, value: draft } = await this.getDraft(),
      publicationRef = await this.getPublicationRef(draft.billId, draft.court),
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
      version: newVersion
    }

    // Replace the current publication with the new version
    this.t.set(publicationRef, newPublication)

    // Mark the draft as published
    this.t.update(draftRef, { publishedVersion: newPublication.version })

    // Add the publication to the archive
    this.t.create(
      db.collection(`/users/${this.uid}/archivedTestimony`).doc(),
      newPublication
    )

    return publicationRef.id
  }

  private async getDraft(): Promise<{
    ref: DocumentReference
    value: DraftTestimony
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

    if (!(await this.isValidBillId(draft.court, draft.billId))) {
      throw fail(
        "failed-precondition",
        `Draft testimony has invalid bill ID ${draft.billId}`
      )
    }

    return { ref, value: draft }
  }

  private async isValidBillId(court: number, billId: string) {
    const doc = await db.doc(`/generalCourts/${court}/bills/${billId}`).get()
    return doc.exists
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
      return Testimony.check(archived.docs[0].data()).version + 1
    }
  }

  private async getPublicationRef(
    billId: string,
    court: number
  ): Promise<DocumentReference> {
    const publications = await this.t.get(
      db
        .collection(`/users/${this.uid}/publishedTestimony`)
        .where("billId", "==", billId)
        .where("court", "==", court)
        .limit(1)
    )

    if (publications.size === 0) {
      return db.collection(`/users/${this.uid}/publishedTestimony`).doc()
    } else {
      return publications.docs[0].ref
    }
  }
}

function fail(code: https.FunctionsErrorCode, message: string) {
  return new https.HttpsError(code, message)
}
