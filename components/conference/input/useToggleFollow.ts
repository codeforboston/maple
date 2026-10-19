import { authStepChanged } from "components/auth/redux"
import { useAppDispatch } from "components/hooks"
import {
  followProfile,
  unfollowProfile
} from "components/shared/FollowingQueries"
import { useInputContext } from "./context"

/** Follow or unfollow an entry's author, sending a signed-out reader to sign
 * in first. */
export function useToggleFollow(authorUid: string) {
  const dispatch = useAppDispatch()
  const { uid, followed, signedIn } = useInputContext()
  const following = followed.has(authorUid)
  const toggle = () =>
    !signedIn
      ? dispatch(authStepChanged("start"))
      : following
      ? unfollowProfile(uid, authorUid)
      : followProfile(uid, authorUid)
  return { following, toggle }
}
