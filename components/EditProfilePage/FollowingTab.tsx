import { useBill } from "components/db"
import { formatBillId } from "components/formatting"
import { Internal } from "components/links"
import { FollowBillButton } from "components/shared/FollowButton"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { useTranslation } from "next-i18next"
import { ComponentProps, useEffect, useMemo, useState } from "react"
import { useAuth } from "../auth"
import { Alert, Col, Row, Spinner } from "../bootstrap"
import { firestore } from "../firebase"
import { FollowUserItem, PaginatedListCard, LoadableList } from "./shared"

export function FollowingTab({ className }: { className?: string }) {
  const uid = useAuth().user?.uid
  const { t } = useTranslation("editProfile")
  const subscriptionRef = useMemo(
    () =>
      // returns new object only if uid changes
      uid
        ? collection(firestore, `/users/${uid}/activeTopicSubscriptions/`)
        : null,
    [uid]
  )
  return (
    <>
      <PaginatedListCard
        className={className}
        title={t("follow.bills")}
        ItemCard={FollowedBillItem}
        {...useFollowList<ComponentProps<typeof FollowedBillItem>>({
          subscriptionRef,
          uid,
          type: "bill"
        })}
      />
      <PaginatedListCard
        className={className}
        title={t("follow.orgs")}
        ItemCard={FollowUserItem}
        {...useFollowList<ComponentProps<typeof FollowUserItem>>({
          subscriptionRef,
          uid,
          type: "testimony"
        })}
      />
      {/* Unfollow modal removed; using Follow buttons directly */}
    </>
  )
}

function useFollowList<T>({
  subscriptionRef,
  uid,
  type
}: {
  subscriptionRef: ReturnType<typeof collection> | null
  uid: string | undefined
  type: "bill" | "testimony"
}): LoadableList<T> {
  const [state, setState] = useState<LoadableList<T>>({
    items: [],
    loading: false,
    error: null
  })
  const { t } = useTranslation("editProfile")

  useEffect(() => {
    if (!subscriptionRef || !uid) return

    setState(prev => ({ ...prev, loading: true, error: null }))
    const unsubscribe = onSnapshot(
      query(
        subscriptionRef,
        where("uid", "==", `${uid}`),
        where("type", "==", type)
      ),
      snap =>
        setState({
          items: snap.docs.map(
            doc => doc.data()[type === "bill" ? "billLookup" : "userLookup"]
          ),
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
  }, [subscriptionRef, uid, type])

  return state
}

function FollowedBillItem({
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
    <div className={`fs-3 lh-lg`}>
      <Row className={`align-items-center flex-column flex-md-row`}>
        <Internal href={`/bills/${court}/${billId}`}>
          {formatBillId(billId)}
        </Internal>
        <Col xs={12} md={8} className={`d-flex`}>
          <h6>{bill.content.Title}</h6>
        </Col>
        <Col xs="auto" className="d-flex justify-content-end ms-auto p-0">
          <FollowBillButton bill={bill} />
        </Col>
      </Row>
      <hr className={`mt-3`} />
    </div>
  )
}
