import { collection, getDocs, query, where } from "firebase/firestore"
import { getFunctions, httpsCallable } from "firebase/functions"
import { useTranslation } from "next-i18next"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useAuth } from "../auth"
import { Stack } from "../bootstrap"
import { firestore } from "../firebase"
import { TitledSectionCard } from "../shared"
import UnfollowItem from "./UnfollowModal"
import { FollowedItem } from "./FollowingTabComponents"
import { BillElement, OrgElement } from "./FollowingTabComponents"

const functions = getFunctions()

const unfollowBillFunction = httpsCallable(functions, "unfollowBill")
const unfollowOrgFunction = httpsCallable(functions, "unfollowOrg")

export type UnfollowModalConfig = {
  court: number
  orgName: string
  type: string
  typeId: string
}

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
  const [orgsFollowing, setOrgsFollowing] = useState<OrgElement[]>([])

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
    const orgsList: OrgElement[] = []
    const q = query(
      subscriptionRef,
      where("uid", "==", `${uid}`),
      where("type", "==", "org")
    )
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(doc => {
      // doc.data() is never undefined for query doc snapshots
      orgsList.push(doc.data().orgLookup)
    })

    if (orgsFollowing.length === 0 && orgsList.length != 0) {
      setOrgsFollowing(orgsList)
    }
  }, [subscriptionRef, uid, orgsFollowing])

  const fetchFollowedItems = useCallback(async () => {
    if (uid) {
      billsFollowingQuery()
      orgsFollowingQuery()
    }
  }, [uid, billsFollowingQuery, orgsFollowingQuery])

  useEffect(() => {
    fetchFollowedItems()
  }, [billsFollowing, orgsFollowing, fetchFollowedItems])

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
    // rest of what was inside the original if statement
    if (unfollow.type == "bill") {
      const billLookup = { billId: unfollow.typeId, court: unfollow.court }
      try {
        const response = await unfollowBillFunction({
          billLookup
        })
        console.log(response.data) // This should print { status: 'success', message: 'Subscription removed' }
      } catch (error: any) {
        console.log(error.message)
      }
    } else {
      const orgLookup = {
        profileId: unfollow.typeId,
        fullName: unfollow.orgName
      }
      try {
        const response = await unfollowOrgFunction({ orgLookup: orgLookup })
        console.log(response.data) // This should print { status: 'success', message: 'Subscription removed' }
      } catch (error: any) {
        console.log(error.message)
      }
    }

    setBillsFollowing([])
    setOrgsFollowing([])
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
            {orgsFollowing.map((element: OrgElement, index: number) => (
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
