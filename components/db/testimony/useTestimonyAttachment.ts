import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  ref,
  StorageReference,
  uploadBytesResumable
} from "firebase/storage"
import { nanoid } from "nanoid"
import {
  Dispatch,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState
} from "react"
import { storage } from "../../firebase"
import { DraftTestimony } from "./types"
import { SetTestimony } from "./useUnsavedTestimony"

const draftAttachment = (uid: string, id: string) =>
  ref(storage, `/users/${uid}/draftAttachments/${id}`)
const publishedAttachment = (id: string) =>
  ref(storage, `/publishedAttachments/${id}`)

type State = {
  uid: string
  status: "loading" | "error" | "ok"

  attachment: {
    draft?: DraftTestimony
    /** A url to view the file in the browser */
    url?: string
    /** The name of the file, as uploaded */
    name?: string
    /** The size of the file in bytes */
    size?: number
    id?: string
    error?: any
  }
}

type Action =
  | { type: "loading" }
  | {
      type: "resolveAttachment"
      id?: string
      url?: string
      name?: string
      size?: number
    }
  | { type: "error"; error: any }
  | { type: "setDraft"; draft: DraftTestimony }

function reducer(state: State, action: Action): State {
  console.info("useTestimonyAttachment", action)
  switch (action.type) {
    case "setDraft": {
      if (action.draft.attachmentId !== state.attachment.id) {
        // Set the draft, initialize rest of state based on it
        return {
          ...state,
          attachment: { draft: action.draft }
        }
      } else {
        return state
      }
    }
    case "resolveAttachment": {
      return {
        ...state,
        status: "ok",
        attachment: {
          draft: state.attachment.draft,
          id: action.id,
          url: action.url,
          name: action.name,
          size: action.size
        }
      }
    }
    case "error": {
      return {
        ...state,
        status: "error",
        attachment: { error: action.error }
      }
    }
    case "loading": {
      return { ...state, status: "loading" }
    }
  }
}

export function usePublishedTestimonyAttachment(id: string) {
  const [url, setUrl] = useState<string | undefined>(undefined)
  useEffect(() => {
    getAttachmentInfo(publishedAttachment(id))
      .then(info => {
        setUrl(info.url)
      })
      .catch(e => {
        console.warn("Error getting published attachment info", e)
      })
  }, [id])
  return url
}

export type UseDraftTestimonyAttachment = ReturnType<
  typeof useDraftTestimonyAttachment
>
export function useDraftTestimonyAttachment(
  uid: string,
  draft: DraftTestimony | undefined,
  setTestimony: SetTestimony
) {
  const [state, dispatch] = useReducer(reducer, {
    uid,
    status: "ok",
    attachment: {}
  })

  useSyncDraft(state, dispatch, draft)

  const remove = useRemove(state, dispatch, setTestimony)
  const upload = useUpload(state, dispatch, setTestimony)
  const {
    attachment: { error, id, url, name, size },
    status
  } = state

  return useMemo(
    () => ({
      remove,
      upload,
      status,
      error,
      id,
      url,
      name,
      size
    }),
    [error, id, name, remove, size, status, upload, url]
  )
}

function useSyncDraft(
  { attachment: { draft }, uid }: State,
  dispatch: Dispatch<Action>,
  currentDraft: DraftTestimony | undefined
) {
  useEffect(() => {
    if (currentDraft) dispatch({ type: "setDraft", draft: currentDraft })
  }, [currentDraft, dispatch])

  useEffect(() => {
    if (draft) {
      const id = draft.attachmentId
      if (id) {
        resolveAttachment(draftAttachment(uid, id), dispatch)
      } else {
        dispatch({ type: "resolveAttachment" })
      }
    }
  }, [dispatch, draft, uid])
}

function useRemove(
  { attachment: { id }, uid }: State,
  dispatch: Dispatch<Action>,
  setTestimony: SetTestimony
) {
  return useCallback(async () => {
    if (id) {
      try {
        dispatch({ type: "loading" })
        await deleteObject(draftAttachment(uid, id))
        dispatch({ type: "resolveAttachment" })
        setTestimony({ attachmentId: null })
      } catch (error) {
        dispatch({ type: "error", error })
      }
    }
  }, [dispatch, id, setTestimony, uid])
}

function useUpload(
  { uid }: State,
  dispatch: Dispatch<Action>,
  setTestimony: SetTestimony
) {
  return useCallback(
    async (file: File) => {
      const id = nanoid()
      const uploadTask = uploadBytesResumable(draftAttachment(uid, id), file, {
        contentDisposition: 'inline; filename="Testimony.pdf"',
        contentType: file.type,
        cacheControl: "private, max-age=3600",
        customMetadata: {
          originalFilename: file.name
        }
      })

      dispatch({ type: "loading" })
      uploadTask.on(
        "state_changed",
        () => {},
        error => {
          dispatch({ type: "error", error })
        },
        () => {
          resolveAttachment(uploadTask.snapshot.ref, dispatch, setTestimony)
        }
      )
    },
    [dispatch, setTestimony, uid]
  )
}

async function resolveAttachment(
  file: StorageReference,
  dispatch: Dispatch<Action>,
  setTestimony?: SetTestimony
) {
  try {
    dispatch({ type: "loading" })
    const info = await getAttachmentInfo(file)
    dispatch({ type: "resolveAttachment", ...info })
    setTestimony?.({ attachmentId: info.id })
  } catch (error) {
    dispatch({ type: "error", error })
  }
}

async function getAttachmentInfo(file: StorageReference) {
  const url = await getDownloadURL(file)
  const metadata = await getMetadata(file)
  return {
    id: file.name,
    url,
    name: metadata.customMetadata?.originalFilename,
    size: metadata.size
  }
}
