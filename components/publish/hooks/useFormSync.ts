import { debounce, isEmpty, isEqual, pickBy } from "lodash"
import { useEffect, useMemo, useState } from "react"
import { UseEditTestimony, WorkingDraft } from "../../db"
import { useAppDispatch } from "../../hooks"
import {
  restoreFromDraft,
  Service,
  setSyncState,
  SyncState,
  syncTestimony
} from "../redux"
import { usePublishState } from "./usePublishState"

const formDebounceMs = 1000

/** Syncs the form to Firestore. */
export function useFormSync(edit: Service) {
  useInitializeFromFirestore(edit)
  useSyncTestimonyToStore(edit)

  const { draft, saveDraft, loading: docsLoading, error: loadingError } = edit,
    dispatch = useAppDispatch(),
    form = useFormDraft(),
    persisted = usePersistedDraft(draft),
    hasError = Boolean(saveDraft.error || loadingError)

  const saveDraftDebounced = useMemo(
    () =>
      debounce(saveDraft.execute, formDebounceMs, {
        leading: true,
        trailing: true
      }),
    [saveDraft.execute]
  )

  const empty = isEmpty(pickBy(form)),
    loading = docsLoading || saveDraft?.loading,
    exists = persisted !== undefined,
    saved = isEqual(form, persisted) || (empty && !exists)

  // TOOD: add error state.
  // - Should not continue re-attempting if error
  // - Should re-attempt when new changes are made to the form
  useEffect(() => {
    if (!saved && !loading && !empty && !hasError) saveDraftDebounced(form)
  }, [empty, form, hasError, loading, saveDraftDebounced, saved])

  let state: SyncState
  if (hasError) {
    state = "error"
  } else if (loading) {
    state = "loading"
  } else if (!saved) {
    state = "unsaved"
  } else {
    state = "synced"
  }
  useEffect(() => void dispatch(setSyncState(state)), [dispatch, state])
  // Reset sync state on unmount
  useEffect(() => () => void dispatch(setSyncState("loading")), [dispatch])
}

function useInitializeFromFirestore({ draft }: UseEditTestimony) {
  const dispatch = useAppDispatch()
  const [initialized, setInitialized] = useState(false)
  useEffect(() => {
    if (!initialized && draft) {
      dispatch(restoreFromDraft(draft))
      setInitialized(true)
    }
  }, [dispatch, draft, initialized])
}

function useSyncTestimonyToStore(edit: UseEditTestimony) {
  const dispatch = useAppDispatch()
  const { draft, publication } = edit
  useEffect(
    () => void dispatch(syncTestimony({ draft, publication })),
    [dispatch, draft, publication]
  )
}

type DraftContent = ReturnType<typeof useFormDraft>
function useFormDraft() {
  const { attachmentId, content, position } = usePublishState()
  return { attachmentId, content, position }
}

function usePersistedDraft(draft?: WorkingDraft): DraftContent | undefined {
  if (!draft) return
  const { attachmentId, content, position } = draft
  return { attachmentId: attachmentId ?? undefined, content, position }
}
