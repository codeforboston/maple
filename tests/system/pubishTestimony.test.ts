import { signInWithEmailAndPassword } from "firebase/auth"
import { addDoc, collection, doc, getDoc } from "firebase/firestore"
import { httpsCallable } from "firebase/functions"
import { auth, firestore, functions } from "../../components/firebase"
import { terminateFirebase } from "../testUtils"

const publishTestimony = httpsCallable<
  { draftId: string },
  { publicationId: string }
>(functions, "publishTestimony")

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

it("can publish testimony", async () => {
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

  const result = await publishTestimony({ draftId: draftRef.id })

  const publication = await getDoc(
    doc(
      firestore,
      `/users/${uid}/publishedTestimony/${result.data.publicationId}`
    )
  )

  expect(publication.exists)
  expect(publication.data()!.content).toEqual(draft.content)
})
