import {
  collection,
  collectionGroup,
  onSnapshot,
  query,
  QuerySnapshot,
  where
} from "firebase/firestore"
import { useEffect, useMemo, useReducer } from "react"
import { firestore } from "../../firebase"
import { BaseTestimony, DraftTestimony, Testimony, WithId } from "./types"

/** Latest draft and publication for a particular user and bill */
export type BillTestimony = {
  billId: string
  draft?: WithId<DraftTestimony>
  publication?: WithId<Testimony>
}

/** Lists all testimony in either published or draft states for a particular
 * user. */
export function useTestimonyListing(uid: string) {
  const [{ draftsLoading, publicationsLoading, error, testimony }, dispatch] =
    useReducer(reducer, initialState)

  useEffect(
    () =>
      onSnapshot(
        query(
          collectionGroup(firestore, "publishedTestimony"),
          where("authorUid", "==", uid)
        ),
        {
          next: snapshot => dispatch({ type: "updatePublications", snapshot }),
          error: error => dispatch({ type: "error", error })
        }
      ),
    [uid]
  )

  useEffect(
    () =>
      onSnapshot(query(collection(firestore, `users/${uid}/draftTestimony`)), {
        next: snapshot => dispatch({ type: "updateDrafts", snapshot }),
        error: error => dispatch({ type: "error", error })
      }),
    [uid]
  )

  return useMemo(
    () => ({ loading: draftsLoading || publicationsLoading, error, testimony }),
    [draftsLoading, error, publicationsLoading, testimony]
  )
}

type State = {
  draftsLoading: boolean
  publicationsLoading: boolean
  error: Error | undefined
  testimony: BillTestimony[] | undefined
  publications: WithId<Testimony>[]
  drafts: WithId<DraftTestimony>[]
}

const initialState: State = {
  draftsLoading: true,
  publicationsLoading: true,
  error: undefined,
  testimony: undefined,
  publications: [],
  drafts: []
}

type Action =
  | { type: "updatePublications"; snapshot: QuerySnapshot }
  | { type: "updateDrafts"; snapshot: QuerySnapshot }
  | { type: "error"; error: Error }

function reducer(state: State, action: Action): State {
  if (action.type === "error") {
    console.warn("Error in useTestimonyListing", action.error)
    return { ...state, error: action.error }
  } else {
    const updated = { ...state }
    if (action.type === "updateDrafts") {
      updated.drafts = mapSnap<DraftTestimony>(action.snapshot)
      updated.draftsLoading = false
    } else if (action.type === "updatePublications") {
      updated.publications = mapSnap<Testimony>(action.snapshot)
      updated.publicationsLoading = false
    }
    updated.testimony = merge(updated.drafts, updated.publications).sort(
      byDraftOnlyThenPublishedAt
    )
    return updated
  }
}

function merge(
  drafts: WithId<DraftTestimony>[],
  publications: WithId<Testimony>[]
): BillTestimony[] {
  const testimony = new Map<string, BillTestimony>()
  drafts.forEach(draft => {
    const billId = draft.value.billId
    const value = testimony.get(billId)
    if (value) {
      value.draft = draft
    } else {
      testimony.set(billId, { billId, draft })
    }
  })
  publications.forEach(publication => {
    const billId = publication.value.billId
    const value = testimony.get(billId)
    if (value) {
      value.publication = publication
    } else {
      testimony.set(billId, { billId, publication })
    }
  })
  return Array.from(testimony.values())
}

function mapSnap<T extends BaseTestimony>(snap: QuerySnapshot) {
  return snap.docs.map(d => ({ id: d.id, value: d.data() as T }))
}

function byDraftOnlyThenPublishedAt(t1: BillTestimony, t2: BillTestimony) {
  if (!t1.publication && !t2.publication) {
    return t1.billId.localeCompare(t2.billId)
  } else if (t1.publication && !t2.publication) {
    return 1
  } else if (!t1.publication && t2.publication) {
    return -1
  } else {
    return (
      t2.publication!.value.publishedAt.toMillis() -
      t1.publication!.value.publishedAt.toMillis()
    )
  }
}
