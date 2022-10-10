import { waitFor } from "@testing-library/react"
import { act, renderHook } from "@testing-library/react-hooks"
import { User } from "firebase/auth"
import { DraftTestimony, Testimony, useEditTestimony } from "."
import {
  createFakeBill,
  signInUser1,
  signInUser3
} from "../../../tests/integration/common"
import { terminateFirebase } from "../../../tests/testUtils"

let uid: string
let user: User
beforeEach(async () => {
  user = await signInUser1()
  uid = user.uid
})

afterAll(terminateFirebase)

let billId: string
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
    court: 192,
    content: "fake testimony",
    position: "endorse"
  }
  testimony = {
    authorUid: uid,
    authorDisplayName: user.displayName!,
    billId,
    content: draft.content,
    court: 192,
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
    const { result } = renderHook(() => useEditTestimony(uid, billId))

    await expectFinishLoading(result)

    expect(result.current.draft).toBeUndefined()
    expect(result.current.publication).toBeUndefined()
    expect(result.current.error).toBeUndefined()
  })

  it("Initializes for a bill with existing testimony and drafts", async () => {
    const billId = "H1"
    const { uid } = await signInUser3()
    const { result } = renderHook(() => useEditTestimony(uid, billId))

    await expectFinishLoading(result)

    expect(result.current.draft?.billId).toEqual(billId)
    expect(result.current.publication).toMatchObject({ billId, authorUid: uid })
  })

  it("Uses initial uid and billId", async () => {
    const { result, rerender } = renderHook(
      ({ uid, billId }: { uid: string; billId: string }) =>
        useEditTestimony(uid, billId),
      { initialProps: { uid, billId } }
    )

    await expectFinishLoading(result)

    rerender({ uid: "fake", billId: "fake" })

    expect(result.current.loading).toBeFalsy()
  })

  async function renderAndDraft() {
    const { result } = renderHook(() => useEditTestimony(uid, billId))
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
    const { result } = renderHook(() => useEditTestimony(uid, billId))
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

  it.skip("Does nothing on publish if draft is up to date", async () => {
    const result = await renderAndPublish()

    await act(() => result.current.publishTestimony.execute())
    expect(result.current.loading).toBeFalsy()
    expect(result.current.publication?.version).toBe(testimony.version)
    expect(result.current.draft?.publishedVersion).toBe(testimony.version)
  })

  it("Updates testimony", async () => {
    const result = await renderAndPublish()

    await act(() => result.current.saveDraft.execute(updatedDraft))

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

  it("Deletes testimony", async () => {
    const result = await renderAndPublish()

    await act(() => result.current.deleteTestimony.execute())
    expect(result.current.publication).toBeUndefined()
  })
})

async function expectFinishLoading(result: any) {
  expect(result.current.loading).toBeTruthy()
  await waitFor(() => expect(result.current.loading).toBeFalsy())
}
