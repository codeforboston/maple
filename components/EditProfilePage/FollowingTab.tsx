import { flags } from "components/featureFlags"
import { dbService } from "components/db/api"
import { useBill } from "components/db"
import { formatBillId } from "components/formatting"
import { Internal } from "components/links"
import {
  FollowBallotQuestionButton,
  FollowBillButton
} from "components/shared/FollowButton"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { useTranslation } from "next-i18next"
import { ComponentProps, useEffect, useMemo, useState } from "react"
import { useAsync } from "react-async-hook"
import { useAuth } from "../auth"
import { Alert, Spinner } from "../bootstrap"
import { firestore } from "../firebase"
import { FollowUserCard } from "./FollowUserCard"
import { FollowedItemRow } from "./FollowedItemRow"
import {
  LoadableItemsState,
  PaginatedItemsCard
} from "components/shared/PaginatedItemsCard"

export function FollowingTab({ className }: { className?: string }) {
  const { t } = useTranslation("editProfile")
  const followedBallotQuestions = useFollowedBallotQuestions()
  // Titles in the cards' header bands, as on the profile page.
  return (
    <>
      <PaginatedItemsCard
        className={className}
        title={t("follow.bills")}
        titleInHeader
        ItemCard={FollowedBillCard}
        {...useFollowedBills()}
      />
      {flags().ballotQuestions && (
        <PaginatedItemsCard
          className={className}
          title={t("follow.ballotQuestions")}
          titleInHeader
          ItemCard={FollowedBallotQuestionCard}
          {...followedBallotQuestions}
        />
      )}
      <PaginatedItemsCard
        className={className}
        title={t("follow.orgs")}
        titleInHeader
        ItemCard={item => <FollowUserCard {...item} confirmUnfollow={true} />}
        {...useFollowedUsers()}
      />
    </>
  )
}

const useFollowedBills = (): LoadableItemsState<
  ComponentProps<typeof FollowedBillCard>
> => useTopicSubscription("bill")

const useFollowedBallotQuestions = (): LoadableItemsState<
  ComponentProps<typeof FollowedBallotQuestionCard>
> => useTopicSubscription("ballotQuestion")

const useFollowedUsers = (): LoadableItemsState<
  ComponentProps<typeof FollowUserCard>
> => useTopicSubscription("testimony")

function useTopicSubscription<T extends object>(
  type: "bill" | "ballotQuestion" | "testimony"
): LoadableItemsState<T> {
  const [state, setState] = useState<LoadableItemsState<T>>({
    items: [],
    loading: false,
    error: null
  })
  const { t } = useTranslation("editProfile")
  const uid = useAuth().user?.uid
  const subscriptionRef = useMemo(
    () =>
      uid
        ? collection(firestore, `/users/${uid}/activeTopicSubscriptions/`)
        : null,
    [uid]
  )
  const topicKey =
    type === "bill"
      ? "billLookup"
      : type === "ballotQuestion"
      ? "ballotQuestionLookup"
      : "userLookup"

  useEffect(() => {
    if (!subscriptionRef || !uid) return

    setState(prev => ({ ...prev, loading: true, error: null }))
    const unsubscribe = onSnapshot(
      query(
        subscriptionRef,
        where("uid", "==", uid),
        where("type", "==", type)
      ),
      snap =>
        setState({
          items: snap.docs.map(doc => doc.data()[topicKey]),
          loading: false,
          error: null
        }),
      err => {
        console.error(`Error listening to followed ${type}`, err)
        setState(prev => ({
          ...prev,
          loading: false,
          error: t("content.error")
        }))
      }
    )

    return () => unsubscribe()
  }, [subscriptionRef, uid, type, topicKey, t])

  return state
}

function FollowedBillCard({
  court,
  billId
}: {
  court: number
  billId: string
}) {
  const { loading, error, result: bill } = useBill(court, billId)
  const { t } = useTranslation("editProfile")
  if (loading) return <Spinner animation="border" className="mx-auto" />
  if (error) return <Alert variant="danger">{t("content.error")}</Alert>
  if (!bill) return null

  return (
    <FollowedItemRow
      lead={
        <Internal href={`/bills/${court}/${billId}`}>
          {formatBillId(billId)}
        </Internal>
      }
      title={bill.content.Title}
      action={<FollowBillButton bill={bill} confirmUnfollow={true} />}
    />
  )
}

function FollowedBallotQuestionCard({
  ballotQuestionId,
  court
}: {
  ballotQuestionId: string
  court: number
}) {
  const { t } = useTranslation("editProfile")
  const {
    loading,
    error,
    result: bq
  } = useAsync(
    () => dbService().getBallotQuestion({ id: ballotQuestionId }),
    [ballotQuestionId]
  )
  if (loading) return <Spinner animation="border" className="mx-auto" />
  if (error) return <Alert variant="danger">{t("content.error")}</Alert>
  if (!bq) return null

  const label =
    bq.ballotQuestionNumber != null
      ? `Question ${bq.ballotQuestionNumber}`
      : bq.description ?? ballotQuestionId

  return (
    <FollowedItemRow
      lead={
        <Internal href={`/ballotQuestions/${ballotQuestionId}`}>
          {label}
        </Internal>
      }
      title={bq.title ?? bq.description}
      action={<FollowBallotQuestionButton ballotQuestion={bq} />}
    />
  )
}
