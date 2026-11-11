import { collection, onSnapshot, query, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { firestore } from "../../firebase"

const NONE: Set<string> = new Set()

/** The profile ids the user follows: their testimony subscriptions. Empty
 * while signed out. */
export function useFollowedAuthors(uid?: string) {
  const [followed, setFollowed] = useState<Set<string>>(NONE)

  useEffect(() => {
    if (!uid) return setFollowed(NONE)
    return onSnapshot(
      query(
        collection(firestore, `/users/${uid}/activeTopicSubscriptions`),
        where("type", "==", "testimony")
      ),
      snapshot =>
        setFollowed(
          new Set(
            snapshot.docs
              .map(d => d.data().userLookup?.profileId as string | undefined)
              .filter((id): id is string => !!id)
          )
        ),
      error => console.warn("Error in useFollowedAuthors", error)
    )
  }, [uid])

  return followed
}
