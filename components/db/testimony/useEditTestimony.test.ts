import { act, renderHook, waitFor } from "@testing-library/react"
import { User } from "firebase/auth"
import { currentGeneralCourt } from "functions/src/shared"
import { nanoid } from "nanoid"
import { DraftTestimony, Testimony, useEditTestimony } from "."
import {
  createFakeBill,
  signInTestAdmin,
  signInUser1,
  signInUser3
} from "../../../tests/integration/common"
import { terminateFirebase, testDb } from "../../../tests/testUtils"

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
  testimony: Omit<Testimony, "publishedAt" | "id" | "updatedAt">,
  updatedDraft: typeof draft,
  updatedTestimony: typeof testimony
beforeEach(() => {
  draft = {
    billId,
    court: court,
    content: "fake testimony",
    position: "endorse",
    ballotQuestionId: null,
    conferenceId: null
  }
  testimony = {
    authorUid: uid,
    authorDisplayName: "private",
    authorRole: "user",
    billTitle: "fake",
    billId,
    content: draft.content,
    fullName: "Anonymous",
    court: court,
    position: draft.position,
    public: false,
    version: 1,
    ballotQuestionId: null,
    conferenceId: null
  }
  updatedDraft = {
    ...draft,
    content: "update",
    position: "oppose",
    editReason: "fix a typo"
  }
  updatedTestimony = {
    ...testimony,
    content: updatedDraft.content,
    position: updatedDraft.position,
    editReason: updatedDraft.editReason,
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

  it("Separates ballot question testimony from bill testimony", async () => {
    const ballotQuestionId = "25-14"

    const legislativePub = testDb.doc(
      `users/${uid}/publishedTestimony/${nanoid()}`
    )
    await legislativePub.create({
      ...testimony,
      id: legislativePub.id,
      content: "legislative publication",
      ballotQuestionId: null
    })

    const ballotPub = testDb.doc(`users/${uid}/publishedTestimony/${nanoid()}`)
    await ballotPub.create({
      ...testimony,
      id: ballotPub.id,
      content: "ballot publication",
      ballotQuestionId
    })

    const legislativeDraft = testDb.doc(
      `users/${uid}/draftTestimony/${nanoid()}`
    )
    await legislativeDraft.create({
      ...draft,
      content: "legislative draft",
      ballotQuestionId: null
    })

    const ballotDraft = testDb.doc(`users/${uid}/draftTestimony/${nanoid()}`)
    await ballotDraft.create({
      ...draft,
      content: "ballot draft",
      ballotQuestionId
    })

    const { result: billResult } = renderHook(() =>
      useEditTestimony(uid, court, billId)
    )
    await expectFinishLoading(billResult)

    expect(billResult.current.draft).toMatchObject({
      content: "legislative draft",
      ballotQuestionId: null
    })
    expect(billResult.current.publication).toMatchObject({
      content: "legislative publication",
      ballotQuestionId: null
    })

    const { result: ballotResult } = renderHook(() =>
      useEditTestimony(uid, court, billId, ballotQuestionId)
    )
    await expectFinishLoading(ballotResult)

    expect(ballotResult.current.draft).toMatchObject({
      content: "ballot draft",
      ballotQuestionId
    })
    expect(ballotResult.current.publication).toMatchObject({
      content: "ballot publication",
      ballotQuestionId
    })

    await legislativePub.delete()
    await ballotPub.delete()
    await legislativeDraft.delete()
    await ballotDraft.delete()
  })

  it("Persists ballotQuestionId when updating drafts", async () => {
    const existingDraft = testDb.doc(`users/${uid}/draftTestimony/${nanoid()}`)
    await existingDraft.create(draft)

    const { result } = renderHook(() => useEditTestimony(uid, court, billId))
    await expectFinishLoading(result)

    await act(() =>
      result.current.saveDraft.execute({
        ...updatedDraft,
        ballotQuestionId: "25-14"
      })
    )
    await expectFinishLoading(result)

    const saved = await existingDraft.get()
    expect(saved.data()).toMatchObject({
      content: updatedDraft.content,
      ballotQuestionId: "25-14"
    })

    await existingDraft.delete()
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

  it("Publishes testimony", async () => {
    const result = await renderAndPublish()

    expect(result.current.publication).toMatchObject(testimony)
    expect(result.current.draft?.publishedVersion).toBe(testimony.version)
  })

  it("Does nothing on publish if draft is up to date", async () => {
    const result = await renderAndPublish()

    await act(() => result.current.publishTestimony.execute())
    expect(result.current.loading).toBeFalsy()
    expect(result.current.publication?.version).toBe(testimony.version)
    expect(result.current.draft?.publishedVersion).toBe(testimony.version)
  })

  it("Updates testimony", async () => {
    const result = await renderAndPublish()

    await act(() => result.current.saveDraft.execute(updatedDraft))
    await waitFor(() =>
      expect(result.current.draft?.publishedVersion).toBeUndefined()
    )

    await act(() => result.current.publishTestimony.execute())
    await expectFinishLoading(result)

    expect(result.current.publication).toMatchObject(updatedTestimony)
    expect(result.current.draft?.publishedVersion).toBe(
      updatedTestimony.version
    )
  })

  it("Clears published version on drafts", async () => {
    const result = await renderAndPublish()

    expect(result.current.draft?.publishedVersion).toBeDefined()
    await act(() => result.current.saveDraft.execute(updatedDraft))
    await waitFor(
      () => expect(result.current.draft?.publishedVersion).toBeUndefined(),
      { timeout: 5000 }
    )
  })

  // only admins can delete testimony
  it("Deletes testimony", async () => {
    const result = await renderAndPublish()

    await signInTestAdmin()
    await act(() => result.current.deleteTestimony.execute())
    expect(result.current.publication).toBeUndefined()
  })
})

async function expectFinishLoading(result: any) {
  await waitFor(() => expect(result.current.loading).toBeFalsy())
}
