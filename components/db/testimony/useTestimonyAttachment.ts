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
import { Maybe } from "../common"

export const draftAttachment = (uid: string, id: string) =>
  ref(storage, `users/${uid}/draftAttachments/${id}`)
export const publishedAttachment = (id: string) =>
  ref(storage, `publishedAttachments/${id}`)

type SetDraftAttachmentId = (id: string | null) => void

type State = {
  uid: string
  status: "loading" | "error" | "ok"

  attachment: {
    draftAttachmentId?: Maybe<string>
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
  | { type: "setDraftAttachmentId"; attachmentId: Maybe<string> }

function reducer(state: State, action: Action): State {
  // console.info("useTestimonyAttachment", action)
  switch (action.type) {
    case "setDraftAttachmentId": {
      if (action.attachmentId !== state.attachment.id) {
        // Set the draft, initialize rest of state based on it
        return {
          ...state,
          attachment: { draftAttachmentId: action.attachmentId }
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
          draftAttachmentId: state.attachment.draftAttachmentId,
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

export async function getPublishedTestimonyAttachmentUrl(id: string) {
  const info = await getAttachmentInfo(publishedAttachment(id))
  return info.url
}

export function usePublishedTestimonyAttachment(id: string) {
  const [url, setUrl] = useState<string | undefined>(undefined)
  useEffect(() => {
    getPublishedTestimonyAttachmentUrl(id)
      .then(setUrl)
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
  draftAttachmentId: Maybe<string>,
  setDraftAttachmentId: SetDraftAttachmentId
) {
  const [state, dispatch] = useReducer(reducer, {
    uid,
    status: "ok",
    attachment: {}
  })

  useSyncDraft(state, dispatch, draftAttachmentId)

  const remove = useRemove(state, dispatch, setDraftAttachmentId)
  const upload = useUpload(state, dispatch, setDraftAttachmentId)
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

// TODO: how to handle no draft vs draft w/o attachment using only attachment id?
function useSyncDraft(
  { attachment: { draftAttachmentId }, uid }: State,
  dispatch: Dispatch<Action>,
  currentDraftAttachmentId: Maybe<string>
) {
  useEffect(() => {
    if (currentDraftAttachmentId)
      dispatch({
        type: "setDraftAttachmentId",
        attachmentId: currentDraftAttachmentId
      })
  }, [currentDraftAttachmentId, dispatch])

  useEffect(() => {
    if (draftAttachmentId) {
      const id = draftAttachmentId
      if (id) {
        resolveAttachment(draftAttachment(uid, id), dispatch)
      } else {
        dispatch({ type: "resolveAttachment" })
      }
    }
  }, [dispatch, draftAttachmentId, uid])
}

function useRemove(
  { attachment: { id }, uid }: State,
  dispatch: Dispatch<Action>,
  setDraftAttachmentId: SetDraftAttachmentId
) {
  return useCallback(async () => {
    if (id) {
      try {
        dispatch({ type: "loading" })
        await deleteObject(draftAttachment(uid, id))
        dispatch({ type: "resolveAttachment" })
        setDraftAttachmentId(null)
      } catch (error) {
        dispatch({ type: "error", error })
      }
    }
  }, [dispatch, id, setDraftAttachmentId, uid])
}

function useUpload(
  { uid }: State,
  dispatch: Dispatch<Action>,
  setDraftAttachmentId: SetDraftAttachmentId
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
          resolveAttachment(
            uploadTask.snapshot.ref,
            dispatch,
            setDraftAttachmentId
          )
        }
      )
    },
    [dispatch, setDraftAttachmentId, uid]
  )
}

async function resolveAttachment(
  file: StorageReference,
  dispatch: Dispatch<Action>,
  setDraftAttachmentId?: SetDraftAttachmentId
) {
  try {
    dispatch({ type: "loading" })
    const info = await getAttachmentInfo(file)
    dispatch({ type: "resolveAttachment", ...info })
    setDraftAttachmentId?.(info.id)
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
