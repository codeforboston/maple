import { useTranslation } from "next-i18next"
import { Alert, Row, Spinner } from "../bootstrap"
import { useBill, usePublicProfile } from "components/db"
import { Dispatch, SetStateAction } from "react"
import { Col } from "../bootstrap"
import { TextButton } from "../buttons"
import { UnfollowModalConfig } from "./UnfollowModal"
import { formatBillId } from "components/formatting"
import { Internal } from "components/links"
import { OrgIconSmall } from "./StyledEditProfileComponents"

export function BillFollowingTitle({
  court,
  id
}: {
  court: number
  id: string
}) {
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

export type BillElement = {
  court: number
  billId: string
}
export type UserElement = {
  profileId: string
  fullName: string
}

export type Element = BillElement | UserElement

export const isBillElement = (element: Element): element is BillElement => {
  return (element as BillElement).billId !== undefined
}

export const isUserElement = (element: Element): element is UserElement => {
  return (element as UserElement).profileId !== undefined
}

export function UnfollowButton({
  fullName,
  element,
  setUnfollow,
  type
}: {
  fullName: string
  element: Element
  setUnfollow: Dispatch<SetStateAction<UnfollowModalConfig | null>>
  type: string
}) {
  const handleClick = () => {
    if (!element) {
      console.error("handleClick was called but element is undefined")
      return
    }
    if (isBillElement(element)) {
      setUnfollow({
        court: element.court,
        userName: "",
        type: "bill",
        typeId: element.billId
      })
    } else {
      setUnfollow({
        court: 0,
        userName: fullName,
        type: "testimony",
        typeId: element.profileId
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
      <TextButton
        label={t("follow.unfollow")}
        className={`d-flex ms-auto p-0 text-decoration-none`}
      />
    </Col>
  )
}
export function FollowedItem({
  element,
  setUnfollow,
  type
}: {
  index: number
  element: Element
  setUnfollow: Dispatch<SetStateAction<UnfollowModalConfig | null>>
  type: string
}) {
  const elementId = isUserElement(element) ? element.profileId : element.billId

  const { result: profile, loading } = usePublicProfile(elementId)

  if (loading) {
    return <Spinner animation="border" className="mx-auto" />
  }
  if (!element) {
    console.log("element is undefined")
    return null
  }

  return (
    <div className={`fs-3 lh-lg`}>
      <Row className={`align-items-center flex-column flex-md-row`}>
        {isBillElement(element) ? (
          <>
            <Internal href={`/bills/${element.court}/${element.billId}`}>
              {formatBillId(element.billId)}
            </Internal>
            <Col xs={12} md={8} className={`d-flex`}>
              <BillFollowingTitle court={element.court} id={element.billId} />
            </Col>
          </>
        ) : (
          <>
            <Col className={"align-items-center d-flex"}>
              <OrgIconSmall
                className="mr-4 mt-0 mb-0 ms-0"
                profileImage={profile?.profileImage}
              />
              <Internal href={`/profile?id=${element.profileId}`}>
                {profile?.fullName}
              </Internal>
            </Col>
          </>
        )}
        <UnfollowButton
          fullName={profile?.fullName ?? "default"}
          element={element}
          setUnfollow={setUnfollow}
          type={type}
        />
      </Row>
      <hr className={`mt-3`} />
    </div>
  )
}
