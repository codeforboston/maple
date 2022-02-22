import { signInWithEmailAndPassword } from "firebase/auth"
import {
  addDoc,
  collection,
  doc,
  DocumentReference,
  getDoc
} from "firebase/firestore"
import { httpsCallable } from "firebase/functions"
import { auth, firestore, functions } from "../../components/firebase"
import { terminateFirebase } from "../testUtils"

const publishTestimony = httpsCallable<
  { draftId: string },
  { publicationId: string }
>(functions, "publishTestimony")

const deleteTestimony = httpsCallable<
  { publicationId: string },
  { deleted: boolean }
>(functions, "deleteTestimony")

let uid: string
beforeAll(async () => {
  const { user } = await signInWithEmailAndPassword(
    auth,
    "systemtestuser@example.com",
    process.env.SYSTEM_TEST_USER_PASSWORD!
  )
  uid = user.uid
})

afterAll(terminateFirebase)

it("can publish and delete testimony", async () => {
  const draft = await expectCreateDraft()
  const publication = await expectPublish(draft.draft, draft.draftRef)
  await expectDelete(publication.id)
})

async function expectCreateDraft() {
  const draft = {
    billId: "H1",
    content: "system test testimony",
    court: 192,
    position: "endorse"
  }

  const draftRef = await addDoc(
    collection(firestore, `/users/${uid}/draftTestimony`),
    draft
  )

  return { draft, draftRef }
}

async function expectPublish(draft: any, draftRef: DocumentReference) {
  const result = await publishTestimony({ draftId: draftRef.id })

  const publication = await getDoc(
    doc(
      firestore,
      `/users/${uid}/publishedTestimony/${result.data.publicationId}`
    )
  )

  expect(publication.exists).toBeTruthy()
  expect(publication.data()!.content).toEqual(draft.content)

  return publication
}

async function expectDelete(publicationId: string) {
  const result = await deleteTestimony({ publicationId: publicationId })
  const deletedDoc = await getDoc(
    doc(firestore, `/users/${uid}/publishedTestimony/${publicationId}`)
  )
  expect(result.data.deleted).toBeTruthy()
  expect(deletedDoc.exists).toBeFalsy()
}
