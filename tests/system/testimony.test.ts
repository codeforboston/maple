import { currentGeneralCourt } from "common/constants"
import { signInWithEmailAndPassword } from "firebase/auth"
import {
  addDoc,
  collection,
  doc,
  DocumentReference,
  getDoc
} from "firebase/firestore"
import { httpsCallable } from "firebase/functions"
import { loremIpsum } from "lorem-ipsum"
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

jest.setTimeout(30000)

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

// Publish some testimony for testing purposes
it.skip("can seed fake testimony", async () => {
  const billsToSeed = ["H1000", "H1001", "H1002", "H1003"]
  for (let billId of billsToSeed) {
    const draft = await expectCreateDraft(createDraft(billId))
    const publication = await expectPublish(draft.draft, draft.draftRef)
  }
})

const positions = ["endorse", "oppose", "neutral"] as const
const createDraft = (billId: string) => {
  const draft = {
    billId,
    court: currentGeneralCourt,
    position: positions[Math.floor(Math.random() * positions.length)],
    content: loremIpsum({ count: 4, units: "paragraphs" })
  }
  return draft
}

async function expectCreateDraft(draft?: any) {
  draft = draft ?? {
    billId: "H1",
    content: "system test testimony",
    court: currentGeneralCourt,
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

  expect(publication.exists()).toBeTruthy()
  expect(publication.data()!.content).toEqual(draft.content)

  return publication
}

async function expectDelete(publicationId: string) {
  const result = await deleteTestimony({ publicationId: publicationId })
  const deletedDoc = await getDoc(
    doc(firestore, `/users/${uid}/publishedTestimony/${publicationId}`)
  )
  expect(result.data.deleted).toBeTruthy()
  expect(deletedDoc.exists()).toBeFalsy()
}
