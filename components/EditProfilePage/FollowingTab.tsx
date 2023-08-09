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

  const FollowingQuery = async (topic: string) => {
    const q = query(
      subscriptionRef,
      where("uid", "==", `${uid}`),
      where("type", "==", `${topic}`)
    )
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(doc => {
      // doc.data() is never undefined for query doc snapshots
      topic == "bill"
        ? billList.push(doc.data().billLookup)
        : orgsList.push(doc.data().profileid)
    })

    if (topic == "bill") {
      if (billsFollowing.length === 0 && billList.length != 0) {
        setBillsFollowing(billList)
      }
    } else {
      if (orgsFollowing.length === 0 && orgsList.length != 0) {
        setOrgsFollowing(orgsList)
      }
    }
  }

  useEffect(() => {
    let topic = "bill"
    uid ? FollowingQuery(topic) : null
    topic = "org"
    uid ? FollowingQuery(topic) : null
  })

  const handleUnfollowClick = async (unfollow: UnfollowModalConfig | null) => {
    if (unfollow !== null) {
      let topicName = ""
      if (unfollow.type == "bill") {
        topicName = `bill-${unfollow.court.toString()}-${unfollow.typeId}`
      } else {
        topicName = `org-${unfollow.typeId}`
      }

      await deleteDoc(doc(subscriptionRef, topicName))

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
            {billsFollowing.map((element: any) => (
              <FollowedItem
                key={element.billIid}
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
            {orgsFollowing.map((element: any) => (
              <FollowedItem
                key={element}
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
  key,
  element,
  setUnfollow,
  type
}: {
  key: number
  element: any
  setUnfollow: Dispatch<SetStateAction<UnfollowModalConfig | null>>
  type: string
}) {
  const { result: profile, loading } = usePublicProfile(element)

  let fullName = "default"
  if (profile?.fullName) {
    fullName = profile.fullName
  }

  return (
    <Styled key={key}>
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
                <Internal href={`organizations/${element}`}>
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
        orgName: fullName,
        type: "org",
        typeId: element
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
