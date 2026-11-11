import {
  collectionGroup,
  onSnapshot,
  orderBy,
  query,
  where
} from "firebase/firestore"
import { useEffect, useState } from "react"
import { firestore } from "../../firebase"
import { ConferenceTestimony } from "./types"

/** Every published testimony on a conference, newest first. Uses the
 * (conferenceId, court, publishedAt) index. A conference gathers testimony for
 * weeks, not years, so the feed pages and filters it in memory. */
export function useConferenceTestimony(court: number, conferenceId: string) {
  const [state, setState] = useState<{
    items: ConferenceTestimony[]
    loading: boolean
    error?: Error
  }>({ items: [], loading: true })

  useEffect(
    () =>
      onSnapshot(
        query(
          collectionGroup(firestore, "publishedTestimony"),
          where("conferenceId", "==", conferenceId),
          where("court", "==", court),
          orderBy("publishedAt", "desc")
        ),
        {
          next: snapshot =>
            setState({
              items: snapshot.docs.map(d => d.data() as ConferenceTestimony),
              loading: false
            }),
          error: error => {
            console.warn("Error in useConferenceTestimony", error)
            setState({ items: [], loading: false, error })
          }
        }
      ),
    [court, conferenceId]
  )

  return state
}
