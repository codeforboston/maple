import { onDocumentWritten } from "firebase-functions/v2/firestore"
import { isEqual, maxBy, pick } from "lodash"
import { db, FieldValue } from "../firebase"
import { Testimony } from "./types"

/** The figures cosigned testimony carries about its cosigns. */
export const cosignTallyFields = [
  "cosignCount",
  "cosignSenateDistrictCount",
  "cosignHouseDistrictCount",
  "lastCosignedAt"
] as const

/** What the tally reads from each cosign. */
const cosignFields = [
  "senatorDistrict",
  "representativeDistrict",
  "firstPublishedAt"
] as const

type Cosign = Pick<Testimony, (typeof cosignFields)[number]>

/** Tallies a testimony's cosigns: how many, from how many distinct Senate and
 * House districts, and when the latest was first filed. A cosigner with no
 * district on file counts toward the total only. With no cosigns there is no
 * `lastCosignedAt`. */
export function cosignTally(cosigns: Cosign[]) {
  const distinct = (districts: (string | undefined)[]) =>
    new Set(districts.filter(Boolean)).size
  const lastCosignedAt =
    maxBy(cosigns, c => c.firstPublishedAt?.toMillis())?.firstPublishedAt ??
    undefined
  return {
    cosignCount: cosigns.length,
    cosignSenateDistrictCount: distinct(cosigns.map(c => c.senatorDistrict)),
    cosignHouseDistrictCount: distinct(
      cosigns.map(c => c.representativeDistrict)
    ),
    ...(lastCosignedAt && { lastCosignedAt })
  }
}

/** Keeps the tally on cosigned testimony. It recounts from the cosigns on
 * every write that changes what a cosign contributes, so a retried or
 * reordered event lands on the same figures. */
export const updateCosignTally = onDocumentWritten(
  {
    document: "/users/{uid}/publishedTestimony/{testimonyId}",
    timeoutSeconds: 30,
    retry: true
  },
  async event => {
    const change = event.data
    if (!change) return
    const cosign = (change.after.data() ?? change.before.data()) as
      | Pick<Testimony, "cosignOfId" | "cosignOfAuthorUid">
      | undefined
    if (!cosign?.cosignOfId || !cosign.cosignOfAuthorUid) return
    const { cosignOfId, cosignOfAuthorUid } = cosign
    // An edit to the note leaves the tally as it was.
    if (
      change.before.exists &&
      change.after.exists &&
      isEqual(
        pick(change.before.data(), cosignFields),
        pick(change.after.data(), cosignFields)
      )
    )
      return

    await db.runTransaction(async t => {
      const parentRef = db.doc(
        `/users/${cosignOfAuthorUid}/publishedTestimony/${cosignOfId}`
      )
      // A deleted parent takes its cosigns with it, so there is nothing to
      // count, and reading them would cost every cosign the cascade deletes.
      const parentSnap = await t.get(parentRef)
      if (!parentSnap.exists) return
      const cosigns = await t.get(
        db
          .collectionGroup("publishedTestimony")
          .where("cosignOfId", "==", cosignOfId)
          .select(...cosignFields)
      )

      const tally = cosignTally(cosigns.docs.map(d => d.data() as Cosign))
      if (isEqual(pick(parentSnap.data(), cosignTallyFields), tally)) return

      t.update(parentRef, {
        ...tally,
        lastCosignedAt: tally.lastCosignedAt ?? FieldValue.delete()
      })
    })
  }
)
