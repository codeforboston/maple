import {
  collection,
  deleteDoc,
  doc,
  query,
  where,
  getDocs
} from "firebase/firestore"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import styled from "styled-components"
import { useAuth } from "../auth"
import { Alert, Col, Row, Spinner, Stack } from "../bootstrap"
import { useBill, usePublicProfile } from "../db"
import { firestore } from "../firebase"
import { formatBillId } from "../formatting"
import { External, Internal } from "../links"
import { TitledSectionCard } from "../shared"
import { OrgIconSmall } from "./StyledEditProfileComponents"
import UnfollowModal from "./UnfollowModal"
import { useTranslation } from "next-i18next"
import { getFunctions, httpsCallable } from "firebase/functions"

const functions = getFunctions()

const unfollowBillFunction = httpsCallable(functions, "unfollowBill")
const unfollowOrgFunction = httpsCallable(functions, "unfollowOrg")

type Props = {
  className?: string
}

export const StyledHeader = styled(External)`
  text-decoration: none;
  font-weight: 1rem;
`

export type UnfollowModalConfig = {
  court: number
  orgName: string
  type: string
  typeId: string
}

export const Styled = styled.div`
  font-size: 2rem;
  a {
    display: inline-flex;
    align-items: baseline;

    font-family: "Nunito";
    font-style: normal;
    font-weight: 500;
    font-size: 25px;
    line-height: 125%;

    text-decoration-line: underline;
  }
  svg {
    max-height: 2rem;
    max-height: 2rem;
  }
`

export function FollowingTab({ className }: Props) {
  const { user } = useAuth()
  const uid = user?.uid
  const subscriptionRef = collection(
    firestore,
    `/users/${uid}/activeTopicSubscriptions/`
  )
  const [unfollow, setUnfollow] = useState<UnfollowModalConfig | null>(null)
  const close = () => setUnfollow(null)

  let billList: string[] = []
  const [billsFollowing, setBillsFollowing] = useState<string[]>([])
  let orgsList: string[] = []
  const [orgsFollowing, setOrgsFollowing] = useState<string[]>([])

  const fetchFollowedItems = async () => {
    if (uid) {
      billsFollowingQuery()
      orgsFollowingQuery()
    }
  }

  const billsFollowingQuery = async () => {
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
  }

  useEffect(() => {
    uid ? billsFollowingQuery() : null
  })

  const orgsFollowingQuery = async () => {
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
  }

  useEffect(() => {
    fetchFollowedItems()
  }, [billsFollowing, orgsFollowing])

  const handleUnfollowClick = async (unfollow: UnfollowModalConfig | null) => {
    // DEBUG
    if (!unfollow?.typeId) {
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
        let billLookup = { billId: unfollow.typeId, court: unfollow.court } // creating billLookup as an object here
        try {
          const response = await unfollowBillFunction({
            billLookup: billLookup
          }) // pass billLookup object here
          console.log(response.data) // This should print { status: 'success', message: 'Subscription removed' }
        } catch (error: any) {
          console.log(error.message)
        }
      } else {
        let orgLookup = {
          profileId: unfollow.typeId,
          fullName: unfollow.orgName
        } // creating orgLookup as an object here
        try {
          const response = await unfollowOrgFunction({ orgLookup: orgLookup }) // pass orgLookup object here
          console.log(response.data) // This should print { status: 'success', message: 'Subscription removed' }
        } catch (error: any) {
          console.log(error.message)
        }
      }

      setBillsFollowing([])
      setOrgsFollowing([])
      setUnfollow(null)
    }
  }
  const { t } = useTranslation("editProfile")

  return (
    <>
      <TitledSectionCard className={className}>
        <div className={`mx-4 mt-3 d-flex flex-column gap-3`}>
          <Stack>
            <h2>{t("follow.bills")}</h2>
            {billsFollowing.map((element: string, index: number) => (
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
            {orgsFollowing.map((element: string, index: number) => (
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
      <UnfollowModal
        handleUnfollowClick={handleUnfollowClick}
        onHide={close}
        onUnfollowClose={() => setUnfollow(null)}
        show={unfollow ? true : false}
        unfollow={unfollow}
      />
    </>
  )
}

function FollowedItem({
  index,
  element,
  setUnfollow,
  type
}: {
  index: number
  element: any
  setUnfollow: Dispatch<SetStateAction<UnfollowModalConfig | null>>
  type: string
}) {
  const { result: profile, loading } = usePublicProfile(element.profileId)

  let fullName = "default"
  if (profile?.fullName) {
    fullName = profile.fullName
  }

  return (
    <Styled key={index}>
      {type === "bill" ? (
        <>
          <StyledHeader
            href={`https://malegislature.gov/Bills/${element?.court}/${element?.billId}`}
          >
            {formatBillId(element?.billId)}
          </StyledHeader>

          <Row>
            <Col xs={9}>
              <BillFollowingTitle court={element?.court} id={element?.billId} />
            </Col>
            <Col>
              <UnfollowButton
                fullName={fullName}
                element={element}
                setUnfollow={setUnfollow}
                type={type}
              />
            </Col>
          </Row>
        </>
      ) : (
        <>
          {loading ? (
            <Row>
              <Spinner animation="border" className="mx-auto" />
            </Row>
          ) : (
            <Row className={`align-items-center`}>
              <Col className={"align-items-center d-flex"}>
                <OrgIconSmall
                  className="mr-4 mt-0 mb-0 ms-0"
                  src={profile?.profileImage}
                />
                <Internal href={`organizations/${element?.profileId}`}>
                  {fullName}
                </Internal>
              </Col>
              <UnfollowButton
                fullName={fullName}
                element={element}
                setUnfollow={setUnfollow}
                type={type}
              />
            </Row>
          )}
        </>
      )}
      <hr className={`mt-3`} />
    </Styled>
  )
}

function BillFollowingTitle({ court, id }: { court: number; id: string }) {
  const { loading, error, result: bill } = useBill(court, id)
  const { t } = useTranslation("editProfile")
  if (loading) {
    return (
      <Row>
        <Spinner animation="border" className="mx-auto" />
      </Row>
    )
  } else if (error) {
    return <Alert variant="danger">{t("content.error")}</Alert>
  } else if (bill) {
    return <h6>{bill?.content.Title}</h6>
  }
  return null
}

function UnfollowButton({
  fullName,
  element,
  setUnfollow,
  type
}: {
  fullName: string
  element: any
  setUnfollow: Dispatch<SetStateAction<UnfollowModalConfig | null>>
  type: string
}) {
  const handleClick = () => {
    if (!element) {
      console.error("handleClick was called but element is undefined")
      return
    }
    if (type === "bill") {
      setUnfollow({
        court: element?.court,
        orgName: "",
        type: "bill",
        typeId: element?.billId
      })
    } else {
      setUnfollow({
        court: 0,
        orgName: element?.fullName,
        type: "org",
        typeId: element?.profileId
      })
    }
  }
  const { t } = useTranslation("editProfile")
  return (
    <Col
      onClick={() => {
        handleClick()
      }}
    >
      <button
        className={`btn btn-link d-flex ms-auto p-0 text-decoration-none`}
      >
        <h6>{t("follow.unfollow")}</h6>
      </button>
    </Col>
  )
}
