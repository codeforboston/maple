import { waitFor } from "@testing-library/react"
import { act, renderHook } from "@testing-library/react-hooks"
import { User } from "firebase/auth"
import { nanoid } from "nanoid"
import { DraftTestimony, Testimony, useEditTestimony } from "."
import {
  createFakeBill,
  signInUser1,
  signInUser3
} from "../../../tests/integration/common"
import { terminateFirebase, testDb } from "../../../tests/testUtils"
import { currentGeneralCourt } from "functions/src/shared"

let uid: string
let user: User
beforeEach(async () => {
  user = await signInUser1()
  uid = user.uid
})

afterAll(terminateFirebase)

let billId: string
const court = currentGeneralCourt
beforeEach(async () => {
  billId = await createFakeBill()
})

let draft: DraftTestimony,
  testimony: Omit<Testimony, "publishedAt" | "id">,
  updatedDraft: typeof draft,
  updatedTestimony: typeof testimony
beforeEach(() => {
  draft = {
    billId,
    court: court,
    content: "fake testimony",
    position: "endorse"
  }
  testimony = {
    authorUid: uid,
    authorDisplayName: user.displayName!,
    authorRole: "user",
    billTitle: "fake bill",
    billId,
    content: draft.content,
    fullName: "Anonymous",
    court: court,
    position: draft.position,
    version: 1
  }
  updatedDraft = { ...draft, content: "update", position: "oppose" }
  updatedTestimony = {
    ...testimony,
    content: updatedDraft.content,
    position: updatedDraft.position,
    version: 2
  }
})

describe("useEditTestimony", () => {
  it("Initializes for bill without testimony", async () => {
    const { result } = renderHook(() => useEditTestimony(uid, court, billId))

    await expectFinishLoading(result)

    expect(result.current.draft).toBeUndefined()
    expect(result.current.publication).toBeUndefined()
    expect(result.current.error).toBeUndefined()
  })

  it("Initializes for a bill with existing testimony and drafts", async () => {
    const billId = await createFakeBill()
    const { uid } = await signInUser3()

    const existingPub = testDb.doc(
      `users/${uid}/publishedTestimony/${nanoid()}`
    )
    await existingPub.create({
      ...testimony,
      billId,
      id: existingPub.id,
      authorUid: uid
    })

    const existingDraft = testDb.doc(`users/${uid}/draftTestimony/${nanoid()}`)
    await existingDraft.create({
      ...draft,
      billId,
      id: existingDraft.id,
      authorUid: uid
    })

    const { result } = renderHook(() => useEditTestimony(uid, court, billId))

    await expectFinishLoading(result)

    expect(result.current.draft?.billId).toEqual(billId)
    expect(result.current.publication).toMatchObject({ billId, authorUid: uid })

    await existingPub.delete()
    await existingDraft.delete()
  })

  it("Uses initial uid and billId", async () => {
    const { result, rerender } = renderHook(
      ({ uid, billId }: { uid: string; billId: string }) =>
        useEditTestimony(uid, court, billId),
      { initialProps: { uid, billId } }
    )

    await expectFinishLoading(result)

    rerender({ uid: "fake", billId: "fake" })

    expect(result.current.loading).toBeFalsy()
  })

  async function renderAndDraft() {
    const { result } = renderHook(() => useEditTestimony(uid, court, billId))
    await expectFinishLoading(result)
    await act(() => result.current.saveDraft.execute(draft))
    await expectFinishLoading(result)
    return result
  }

  it("Creates drafts", async () => {
    const result = await renderAndDraft()
    expect(result.current.draft).toMatchObject(draft)
  })

  it("Updates drafts", async () => {
    const result = await renderAndDraft()

    await act(() => result.current.saveDraft.execute(updatedDraft))
    await waitFor(() =>
      expect(result.current.draft).toMatchObject(updatedDraft)
    )
  })

  it("Discards drafts", async () => {
    const result = await renderAndDraft()

    await act(() => result.current.discardDraft.execute())
    expect(result.current.draft).toBeUndefined()
  })

  async function renderAndPublish() {
    const { result } = renderHook(() => useEditTestimony(uid, court, billId))
    await expectFinishLoading(result)
    await act(() => result.current.saveDraft.execute(draft))
    await expectFinishLoading(result)
    await act(() => result.current.publishTestimony.execute())
    await expectFinishLoading(result)

    return result
  }

  // new name/fullname/authorname pattern has been implemented
  it.skip("Publishes testimony", async () => {
    const result = await renderAndPublish()

    expect(result.current.publication).toMatchObject(testimony)
    expect(result.current.draft?.publishedVersion).toBe(testimony.version)
  })

  it.skip("Does nothing on publish if draft is up to date", async () => {
    const result = await renderAndPublish()

    await act(() => result.current.publishTestimony.execute())
    expect(result.current.loading).toBeFalsy()
    expect(result.current.publication?.version).toBe(testimony.version)
    expect(result.current.draft?.publishedVersion).toBe(testimony.version)
  })

  // updating testimony now requires an edit reason
  it.skip("Updates testimony", async () => {
    const result = await renderAndPublish()

    await act(() => result.current.saveDraft.execute(updatedDraft))

    await act(() => result.current.publishTestimony.execute())
    await expectFinishLoading(result)

    expect(result.current.publication).toMatchObject(updatedTestimony)
    expect(result.current.draft?.publishedVersion).toBe(
      updatedTestimony.version
    )
  })

  it.skip("Clears published version on drafts", async () => {
    const result = await renderAndPublish()

    expect(result.current.draft?.publishedVersion).toBeDefined()
    await act(() => result.current.saveDraft.execute(updatedDraft))
    await waitFor(
      () => expect(result.current.draft?.publishedVersion).toBeUndefined(),
      { timeout: 5000 }
    )
  })

  // users can no longer delete their own testimony. only admins can delete testomony.
  it.skip("Deletes testimony", async () => {
    const result = await renderAndPublish()

    await act(() => result.current.deleteTestimony.execute())
    expect(result.current.publication).toBeUndefined()
  })
})

async function expectFinishLoading(result: any) {
  expect(result.current.loading).toBeTruthy()
  await waitFor(() => expect(result.current.loading).toBeFalsy())
}
