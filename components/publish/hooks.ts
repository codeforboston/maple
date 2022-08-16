import { debounce, isEmpty, isEqual, pickBy } from "lodash"
import { useEffect, useMemo, useState } from "react"
import {
  Bill,
  DraftTestimony,
  getBill,
  UseEditTestimony,
  useEditTestimony,
  WorkingDraft
} from "../db"
import { createAppThunk, useAppDispatch } from "../hooks"
import {
  bindService,
  restoreFromDraft,
  setPublicationInfo,
  setStep,
  setSyncState,
  SyncState,
  syncTestimony,
  usePublishState
} from "./redux"

const formDebounceMs = 1000

export const useFormPersistence = (billId: string, authorUid: string) => {
  const edit = useEditTestimony(authorUid, billId)
  useInitializeFromFirestore(edit)
  useSyncToStore(edit)

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
    unsaved = !isEqual(form, persisted)

  // TOOD: add error state.
  // - Should not continue re-attempting if error
  // - Should re-attempt when new changes are made to the form
  useEffect(() => {
    if (unsaved && !loading && !empty && !hasError) saveDraftDebounced(form)
  }, [empty, form, hasError, loading, saveDraftDebounced, unsaved])

  let state: SyncState
  if (hasError) {
    state = "error"
  } else if (loading) {
    state = "loading"
  } else if (unsaved) {
    state = "unsaved"
  } else if (empty) {
    state = "empty"
  } else {
    state = "synced"
  }
  useEffect(() => void dispatch(setSyncState(state)), [dispatch, state])
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

function useSyncToStore(edit: UseEditTestimony) {
  const dispatch = useAppDispatch()
  const { draft, publication } = edit
  useEffect(
    () => void dispatch(syncTestimony({ draft, publication })),
    [dispatch, draft, publication]
  )
  useEffect(() => void dispatch(bindService(edit)), [dispatch, edit])
  // Clear the hook on unmount
  useEffect(() => () => void dispatch(bindService(undefined)), [dispatch])
}

function usePersistedDraft(draft?: WorkingDraft): DraftContent | undefined {
  if (!draft) return
  const { attachmentId, content, position } = draft
  return { attachmentId: attachmentId ?? undefined, content, position }
}

type DraftContent = ReturnType<typeof useFormDraft>
export function useFormDraft() {
  const { attachmentId, content, position } = usePublishState()
  return { attachmentId, content, position }
}

export const resolvePublicationInfo = createAppThunk(
  "publish/resolvePublicationInfo",
  async (
    info: { billId?: string; bill?: Bill; authorUid: string },
    { dispatch }
  ) => {
    let bill: Bill | undefined = info.bill
    if (!bill) {
      if (!info.billId) throw Error("billId or bill required")
      bill = await getBill(info.billId)
    }
    dispatch(setPublicationInfo({ authorUid: info.authorUid, bill }))
  }
)

export const publishTestimonyAndProceed = createAppThunk(
  "publish/publishTestimony",
  async (_, { dispatch, getState }) => {
    const {
      publish: { step, sync, draft, service: edit },
      profile: { profile }
    } = getState()

    if (step !== "publish") throw Error("must be on publish step to publish")
    if (sync !== "synced") throw Error("must be synced to publish")

    DraftTestimony.check(draft)

    await edit?.publishTestimony.execute()

    const hasLegislators = Boolean(profile?.representative && profile.senator)
    if (hasLegislators) {
      dispatch(setStep("share"))
    } else {
      dispatch(setStep("selectLegislators"))
    }
  }
)
