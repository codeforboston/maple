import { debounce, isEmpty, isEqual, isUndefined, pickBy } from "lodash"
import { useEffect, useMemo, useState } from "react"
import {
  Bill,
  getBill,
  UseEditTestimony,
  useEditTestimony,
  WorkingDraft
} from "../db"
import { createAppThunk, useAppDispatch } from "../hooks"
import {
  restoreFromDraft,
  setPublicationInfo,
  setSync,
  SyncState,
  syncTestimony,
  usePublishState
} from "./redux"

const formDebounceMs = 1000

export const useFormPersistence = (billId: string, authorUid: string) => {
  const edit = useEditTestimony(authorUid, billId)
  useInitializeFromFirestore(edit)
  useSyncToStore(edit)

  const { draft, saveDraft, loading: docsLoading } = edit,
    dispatch = useAppDispatch(),
    form = useFormDraft(),
    persisted = usePersistedDraft(draft)

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
    if (!loading && unsaved && !empty && !saveDraft.error)
      saveDraftDebounced(form)
  }, [empty, form, loading, saveDraft.error, saveDraftDebounced, unsaved])

  let state: SyncState
  if (loading) {
    state = "loading"
  } else if (unsaved) {
    state = "unsaved"
  } else if (empty) {
    state = "empty"
  } else {
    state = "synced"
  }
  useEffect(() => void dispatch(setSync(state)), [dispatch, state])
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

function useSyncToStore({ draft, publication }: UseEditTestimony) {
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(syncTestimony({ draft, publication }))
  }, [dispatch, draft, publication])
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

export type PanelStatus =
  | "signedOut"
  | "noTestimony"
  | "createInProgress"
  | "published"
  | "editInProgress"

/** What to display on the testimony panel on the bill detail page */
export const usePanelStatus = () => {
  const { draft, publication } = usePublishState()

  let status: PanelStatus = "signedOut"
  if (!draft && !publication) {
    status = "noTestimony"
  } else if (draft && !publication) {
    status = "createInProgress"
  } else if (draft && publication) {
    if (!isUndefined(draft.publishedVersion)) {
      status = "published"
    } else {
      status = "editInProgress"
    }
  }

  return status
}
