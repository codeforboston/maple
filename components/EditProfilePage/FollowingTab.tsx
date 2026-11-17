import { flags } from "components/featureFlags"
import { dbService } from "components/db/api"
import { useBill } from "components/db"
import { formatBillId } from "components/formatting"
import { Internal, maple } from "components/links"
import { conferenceName, isShown } from "components/conference/types"
import { getConference } from "components/db/conferences"
import {
  FollowBallotQuestionButton,
  FollowBillButton,
  FollowConferenceTopicButton
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
  const followedConferences = useFollowedConferences()
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
      {flags().conferences && (
        <PaginatedItemsCard
          className={className}
          title={t("follow.conferences")}
          titleInHeader
          ItemCard={FollowedConferenceCard}
          {...followedConferences}
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

const useFollowedConferences = (): LoadableItemsState<
  ComponentProps<typeof FollowedConferenceCard>
> => useTopicSubscription("conference")

const useFollowedUsers = (): LoadableItemsState<
  ComponentProps<typeof FollowUserCard>
> => useTopicSubscription("testimony")

/** The field of a subscription doc that says what is followed, by type. */
const TOPIC_KEYS = {
  bill: "billLookup",
  ballotQuestion: "ballotQuestionLookup",
  conference: "conferenceLookup",
  testimony: "userLookup"
} as const

function useTopicSubscription<T extends object>(
  type: keyof typeof TOPIC_KEYS
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
  const topicKey = TOPIC_KEYS[type]

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

/** A followed conference. One that is hidden, no longer taking input while
 * closed conferences are off, keeps its row without a link, so the reader can
 * still unfollow it. */
function FollowedConferenceCard({
  conferenceId,
  court
}: {
  conferenceId: string
  court: number
}) {
  const { t } = useTranslation("editProfile")
  const {
    loading,
    error,
    result: conference
  } = useAsync(() => getConference(court, conferenceId), [court, conferenceId])
  if (loading) return <Spinner animation="border" className="mx-auto" />
  if (error) return <Alert variant="danger">{t("content.error")}</Alert>

  const shown = conference && isShown(conference)

  return (
    <FollowedItemRow
      lead={
        shown ? (
          <Internal href={maple.conference({ court, id: conferenceId })}>
            {conferenceName(conference)}
          </Internal>
        ) : conference ? (
          conferenceName(conference)
        ) : (
          conferenceId
        )
      }
      action={
        <FollowConferenceTopicButton
          conference={{ id: conferenceId, court }}
          confirmUnfollow
        />
      }
    />
  )
}
