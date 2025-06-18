import { debounce, isEmpty, isEqual, pickBy } from "lodash"
import { useEffect, useMemo, useRef, useState } from "react"
import { UseEditTestimony } from "../../db"
import { useAppDispatch } from "../../hooks"
import {
  Service,
  SyncState,
  restoreFromDraft,
  setSyncState,
  syncTestimony
} from "../redux"
import { usePublishState } from "./usePublishState"
import { WorkingDraft } from "common/testimony/types"

const formDebounceMs = 1000

/** Syncs the form to Firestore. */
export function useFormSync(edit: Service) {
  useInitializeFromFirestore(edit)
  useSyncTestimonyToStore(edit)

  const { draft, saveDraft, loading: docsLoading, error: loadingError } = edit,
    dispatch = useAppDispatch(),
    form = useFormDraft(),
    persisted = usePersistedDraft(draft),
    lastSubmittedForm = useRef<DraftContent>(),
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
    if (
      !saved &&
      !loading &&
      !empty &&
      !hasError &&
      !isEqual(form, lastSubmittedForm.current)
    ) {
      lastSubmittedForm.current = form
      saveDraftDebounced(form)
    }
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
  const { attachmentId, content, position, recipientMemberCodes, editReason } =
    usePublishState()
  return { attachmentId, content, position, recipientMemberCodes, editReason }
}

function usePersistedDraft(draft?: WorkingDraft): DraftContent | undefined {
  if (!draft) return
  const { attachmentId, content, position, recipientMemberCodes, editReason } =
    draft
  return {
    attachmentId: attachmentId ?? undefined,
    content,
    position,
    recipientMemberCodes: recipientMemberCodes ?? undefined,
    editReason: editReason ?? undefined
  }
}
