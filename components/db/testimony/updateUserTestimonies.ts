import {
  collection,
  collectionGroup,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch
} from "firebase/firestore"
import { firestore } from "../../firebase"

// Updates the displayName for all testimonies under specified user
export const updateUserDisplayNameTestimonies = async (
  uid: string,
  displayName: string,
  fullName: string
) => {
  const batch = writeBatch(firestore)
  return getAllTestimony(uid).then(({ publishedTestimony, draftTestimony }) => {
    publishedTestimony.forEach(doc =>
      batch.update(doc.ref, {
        authorDisplayName: displayName,
        fullName: fullName
      })
    )
    draftTestimony.forEach(doc =>
      batch.update(doc.ref, {
        authorDisplayName: displayName,
        fullName: fullName
      })
    )
    batch.commit().then(result => result)
  })
}

export const getAllTestimony = async (uid: string) => {
  // Get all the published testimony under user
  const pTestimony = getDocs(
    collection(firestore, `users/${uid}/publishedTestimony`)
  )
  // Get all the draft testimony under user
  const dTestimony = getDocs(
    collection(firestore, `users/${uid}/draftTestimony`)
  )

  const [publishedTestimony, draftTestimony] = await Promise.all([
    pTestimony,
    dTestimony
  ])

  return {
    publishedTestimony: publishedTestimony,
    draftTestimony: draftTestimony
  }
}
