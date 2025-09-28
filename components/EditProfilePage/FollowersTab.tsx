import { functions } from "components/firebase"
import { httpsCallable } from "firebase/functions"
import { useTranslation } from "next-i18next"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useAuth } from "../auth"
import {
  FollowUserCard,
  PaginatedItemsCard,
  LoadableItemsState
} from "./shared"

export const FollowersTab = ({
  className,
  setFollowerCount
}: {
  className?: string
  setFollowerCount: Dispatch<SetStateAction<number | null>>
}) => {
  const uid = useAuth().user?.uid
  const [state, setState] = useState<LoadableItemsState<string>>({
    items: [],
    loading: true,
    error: null
  })
  const { t } = useTranslation("editProfile")

  const fetchFollowers = async () => {
    try {
      const { data: followerIds } = await httpsCallable<void, string[]>(
        functions,
        "getFollowers"
      )()
      setState({ items: followerIds, loading: false, error: null })
      setFollowerCount(followerIds.length)
    } catch (err) {
      console.error("Error fetching followerIds", err)
      setState({
        items: [],
        loading: false,
        error: t("content.error")
      })
    }
  }
  useEffect(() => {
    if (uid) {
      setState(prev => ({ ...prev, loading: true, error: null }))
      fetchFollowers()
    } else {
      setState({ items: [], loading: false, error: null })
    }
  }, [uid])
  return (
    <PaginatedItemsCard
      className={className}
      title={t("follow.your_followers")}
      description={t("follow.follower_info_disclaimer")}
      ItemCard={profileId => <FollowUserCard profileId={profileId} />}
      {...state}
    />
  )
}
