import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  DocumentReference,
  onSnapshot,
  updateDoc
} from "firebase/firestore"
import { Dispatch, useCallback, useEffect, useMemo, useReducer } from "react"
import { useAsyncCallback, UseAsyncReturn } from "react-async-hook"
import { firestore } from "../../firebase"
import { currentGeneralCourt } from "../common"
import { resolveBillTestimony } from "./resolveTestimony"
import {
  deleteTestimony,
  DraftTestimony,
  publishTestimony,
  Testimony,
  WorkingDraft
} from "./types"

export interface UseEditTestimony {
  /** The last hook error produced in loading the `draft` or `publication`. This
   * is separate from each callback's `error` property, which indicates errors
   * in that specific operation. */
  error?: Error
  /** Whether the hook is loading the `draft` or `publication`. This is separate
   * from each callback's `loading` property, which indicates whether that
   * operation is loading */
  loading: boolean
  draftLoading: boolean
  publicationLoading: boolean

  /** The current draft version of the testimony, if any.  */
  draft?: WorkingDraft
  /** The current published version of the testimony, if any.  */
  publication?: Testimony

  /** Saves the given `position` and `content` to the draft version of the
   * testimony. This should not be called while the hook is `loading` or has an
   * `error`.
   *
   * - `saveDraft.execute({position, content})` Starts the operation
   * - `saveDraft.loading` Whether the operation is currently running
   * - `saveDraft.error` Any error produced by the operation
   */
  saveDraft: UseAsyncReturn<void, [SaveDraftRequest]>
  /** Deletes the current draft version of the testimony. Does nothing if there
   * is no draft. This should not be called while the hook is `loading` or has
   * an `error`.
   *
   * - `discardDraft.execute()` Starts the operation
   * - `discardDraft.loading` Whether the operation is currently running
   * - `discardDraft.error` Any error produced by the operation
   */
  discardDraft: UseAsyncReturn<void, []>
  /** Publishes the current draft version of the testimony. This should be
   * called after `saveDraft` completes, to ensure all content is included in
   * the publication. This should not be called while the hook is `loading` or
   * has an `error`.
   *
   * - `publishTestimony.execute()` Starts the operation
   * - `publishTestimony.loading` Whether the operation is currently running
   * - `publishTestimony.error` Any error produced by the operation
   */
  publishTestimony: UseAsyncReturn<void, []>
  /** Deletes the current published version of the testimony. Does nothing if
   * nothing's been published yet. This should not be called while the hook is
   * `loading` or has an `error`.
   *
   * - `deleteTestimony.execute()` Starts the operation
   * - `deleteTestimony.loading` Whether the operation is currently running
   * - `deleteTestimony.error` Any error produced by the operation
   */
  deleteTestimony: UseAsyncReturn<void, []>
}

/**
 * Load, save, and publish testimony for a particular user and bill.
 *
 * The initial `uid` and `billId` are used for the lifetime of the hook
 */
export function useEditTestimony(
  uid: string,
  billId: string
): UseEditTestimony {
  const [state, dispatch] = useReducer(reducer, {
    draftLoading: true,
    publicationLoading: true,
    uid,
    billId
  })

  useTestimony(state, dispatch)
  const saveDraft = useSaveDraft(state, dispatch)
  const discardDraft = useDiscardDraft(state, dispatch)
  const publishTestimony = usePublishTestimony(state, dispatch)
  const deleteTestimony = useDeleteTestimony(state, dispatch)
  const { draft, error, draftLoading, publicationLoading, publication } = state

  return useMemo(
    () => ({
      saveDraft,
      discardDraft,
      publishTestimony,
      deleteTestimony,
      draft,
      error,
      loading: draftLoading || publicationLoading,
      draftLoading,
      publicationLoading,
      publication
    }),
    [
      deleteTestimony,
      discardDraft,
      draft,
      draftLoading,
      error,
      publication,
      publicationLoading,
      publishTestimony,
      saveDraft
    ]
  )
}

function useTestimony(
  { uid, billId, draftRef, publicationRef }: State,
  dispatch: Dispatch<Action>
) {
  useEffect(() => {
    resolveBillTestimony(uid, billId)
      .then(({ draft, publication }) => {
        dispatch({ type: "resolveDraft", id: draft?.id })
        dispatch({ type: "resolvePublication", id: publication?.id })
      })
      .catch(error => dispatch({ type: "error", error }))
  }, [billId, dispatch, uid])

  useEffect(() => {
    if (draftRef)
      return onSnapshot(draftRef, {
        next: snap =>
          snap.exists() &&
          dispatch({ type: "loadDraft", value: snap.data() as WorkingDraft }),
        error: error => dispatch({ type: "error", error })
      })
  }, [dispatch, draftRef])

  useEffect(() => {
    if (publicationRef)
      return onSnapshot(publicationRef, {
        next: snap =>
          snap.exists() &&
          dispatch({
            type: "loadPublication",
            value: snap.data() as Testimony
          }),
        error: error => dispatch({ type: "error", error })
      })
  }, [dispatch, publicationRef])
}

function usePublishTestimony(
  { draft: workingDraft, draftRef }: State,
  dispatch: Dispatch<Action>
) {
  return useAsyncCallback(
    useCallback(async () => {
      DraftTestimony.check(workingDraft)
      // TODO: don't publish again if draft.publishedVersion is defined
      if (draftRef) {
        const result = await publishTestimony({ draftId: draftRef.id })
        dispatch({ type: "resolvePublication", id: result.data.publicationId })
      }
    }, [dispatch, draftRef, workingDraft]),
    { onError: error => dispatch({ type: "error", error }) }
  )
}

function useDeleteTestimony(
  { publicationRef }: State,
  dispatch: Dispatch<Action>
) {
  return useAsyncCallback(
    useCallback(async () => {
      if (publicationRef) {
        const result = await deleteTestimony({
          publicationId: publicationRef.id
        })
        if (result.data.deleted) dispatch({ type: "deletePublication" })
      }
    }, [dispatch, publicationRef]),
    { onError: error => dispatch({ type: "error", error }) }
  )
}

function useDiscardDraft({ draftRef }: State, dispatch: Dispatch<Action>) {
  return useAsyncCallback(
    useCallback(async () => {
      if (draftRef) {
        await deleteDoc(draftRef)
        dispatch({ type: "discardDraft" })
      }
    }, [dispatch, draftRef]),
    { onError: error => dispatch({ type: "error", error }) }
  )
}

type SaveDraftRequest = Pick<
  WorkingDraft,
  "position" | "content" | "attachmentId"
>
function useSaveDraft(
  { draftRef, draftLoading, billId, uid }: State,
  dispatch: Dispatch<Action>
) {
  return useAsyncCallback(
    useCallback(
      async ({ position, content, attachmentId }: SaveDraftRequest) => {
        if (draftLoading) {
          return
        } else if (!draftRef) {
          const newDraft: WorkingDraft = {
            billId,
            content,
            court: currentGeneralCourt,
            position,
            attachmentId: attachmentId ?? null
          }
          const result = await addDoc(
            collection(firestore, `/users/${uid}/draftTestimony`),
            newDraft
          )
          dispatch({ type: "resolveDraft", id: result.id })
        } else if (draftRef) {
          dispatch({ type: "loadingDraft" })
          await updateDoc(draftRef, {
            position,
            content,
            attachmentId: attachmentId ?? null,
            publishedVersion: deleteField()
          })
        }
      },
      [billId, dispatch, draftLoading, draftRef, uid]
    ),
    { onError: error => dispatch({ type: "error", error }) }
  )
}

type State = {
  uid: string
  billId: string
  error?: Error

  draft?: WorkingDraft
  draftRef?: DocumentReference
  draftLoading: boolean

  publication?: Testimony
  publicationRef?: DocumentReference
  publicationLoading: boolean
}

type Action =
  | { type: "error"; error: Error }
  | { type: "loadDraft"; value: WorkingDraft }
  | { type: "loadPublication"; value: Testimony }
  | { type: "deletePublication" }
  | { type: "discardDraft" }
  | { type: "resolveDraft"; id?: string }
  | { type: "resolvePublication"; id?: string }
  | { type: "loadingDraft" }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "error":
      console.warn("Error in useEditTestimony", action.error)
      return { ...state, error: action.error }
    case "loadPublication":
      return { ...state, publication: action.value, publicationLoading: false }
    case "loadDraft":
      return { ...state, draft: action.value, draftLoading: false }
    case "loadingDraft":
      return { ...state, draftLoading: true }
    case "deletePublication":
      return {
        ...state,
        publicationLoading: false,
        publicationRef: undefined,
        publication: undefined
      }
    case "discardDraft":
      return {
        ...state,
        draftLoading: false,
        draftRef: undefined,
        draft: undefined
      }
    case "resolveDraft": {
      return {
        ...state,
        draftRef: action.id
          ? doc(firestore, `/users/${state.uid}/draftTestimony/${action.id}`)
          : undefined,
        draftLoading: !!action.id,
        draft: undefined
      }
    }
    case "resolvePublication": {
      return {
        ...state,
        publication: undefined,
        publicationLoading: !!action.id,
        publicationRef: action.id
          ? doc(firestore, `users/${state.uid}/publishedTestimony/${action.id}`)
          : undefined
      }
    }
  }
}
