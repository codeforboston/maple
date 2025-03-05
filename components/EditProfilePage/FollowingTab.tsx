import { collection, getDocs, query, where } from "firebase/firestore"
import { getFunctions } from "firebase/functions"
import { useTranslation } from "next-i18next"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useAuth } from "../auth"
import { Stack } from "../bootstrap"
import { firestore } from "../firebase"
import { TitledSectionCard } from "../shared"
import UnfollowItem, { UnfollowModalConfig } from "./UnfollowModal"
import { FollowedItem } from "./FollowingTabComponents"
import { BillElement, UserElement } from "./FollowingTabComponents"
import { deleteItem } from "components/shared/FollowingQueries"

export function FollowingTab({ className }: { className?: string }) {
  const { user } = useAuth()
  const uid = user?.uid
  const subscriptionRef = useMemo(
    () =>
      // returns new object only if uid changes
      uid
        ? collection(firestore, `/users/${uid}/activeTopicSubscriptions/`)
        : null,
    [uid]
  )

  const [unfollow, setUnfollow] = useState<UnfollowModalConfig | null>(null)
  const close = () => setUnfollow(null)

  const [billsFollowing, setBillsFollowing] = useState<BillElement[]>([])
  const [usersFollowing, setUsersFollowing] = useState<UserElement[]>([])

  const billsFollowingQuery = useCallback(async () => {
    if (!subscriptionRef) return // handle the case where subscriptionRef is null
    const billList: BillElement[] = []
    const q = query(
      subscriptionRef,
      where("uid", "==", `${uid}`),
      where("type", "==", "bill")
    )
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(doc => {
      // doc.data() is never undefined for query doc snapshots
      billList.push(doc.data().billLookup)
    })
    if (billsFollowing.length === 0 && billList.length != 0) {
      setBillsFollowing(billList)
    }
  }, [subscriptionRef, uid, billsFollowing])

  useEffect(() => {
    uid ? billsFollowingQuery() : null
  })

  const orgsFollowingQuery = useCallback(async () => {
    if (!subscriptionRef) return // handle the case where subscriptionRef is null
    const usersList: UserElement[] = []
    const q = query(
      subscriptionRef,
      where("uid", "==", `${uid}`),
      where("type", "==", "testimony")
    )
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(doc => {
      // doc.data() is never undefined for query doc snapshots
      usersList.push(doc.data().userLookup)
    })

    if (usersFollowing.length === 0 && usersList.length != 0) {
      setUsersFollowing(usersList)
    }
  }, [subscriptionRef, uid, usersFollowing])

  const fetchFollowedItems = useCallback(async () => {
    if (uid) {
      billsFollowingQuery()
      orgsFollowingQuery()
    }
  }, [uid, billsFollowingQuery, orgsFollowingQuery])

  useEffect(() => {
    fetchFollowedItems()
  }, [billsFollowing, usersFollowing, fetchFollowedItems])

  const handleUnfollowClick = async (unfollow: UnfollowModalConfig | null) => {
    if (!unfollow || !unfollow.typeId) {
      // handle the case where unfollow is null or unfollow.typeId is undefined
      console.error(
        "handleUnfollowClick was called but unfollow or unfollow.typeId is undefined"
      )
      return
    }

    if (unfollow === null) {
      return
    }
    try {
      deleteItem({ uid, unfollowItem: unfollow })
    } catch (error: any) {
      console.log(error.message)
    }

    setBillsFollowing([])
    setUsersFollowing([])
    setUnfollow(null)
  }

  const { t } = useTranslation("editProfile")

  return (
    <>
      <TitledSectionCard className={className}>
        <div className={`mx-4 mt-3 d-flex flex-column gap-3`}>
          <Stack>
            <h2>{t("follow.bills")}</h2>
            {billsFollowing.map((element: BillElement, index: number) => (
              <FollowedItem
                key={index}
                index={index}
                element={element}
                setUnfollow={setUnfollow}
                type={"bill"}
              />
            ))}
          </Stack>
        </div>
      </TitledSectionCard>
      <TitledSectionCard className={`${className}`}>
        <div className={`mx-4 mt-3 d-flex flex-column gap-3`}>
          <Stack>
            <h2 className="pb-3">{t("follow.orgs")}</h2>
            {usersFollowing.map((element: UserElement, index: number) => (
              <FollowedItem
                key={index}
                index={index}
                element={element}
                setUnfollow={setUnfollow}
                type={"org"}
              />
            ))}
          </Stack>
        </div>
      </TitledSectionCard>
      <UnfollowItem
        handleUnfollowClick={handleUnfollowClick}
        onHide={close}
        onUnfollowClose={() => setUnfollow(null)}
        show={unfollow ? true : false}
        unfollowItem={unfollow}
      />
    </>
  )
}
