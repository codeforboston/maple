import { usePublicProfile } from "components/db"
import { Internal } from "components/links"
import { FollowUserButton } from "components/shared/FollowButton"
import { useTranslation } from "next-i18next"
import React from "react"
import { Row, Spinner } from "../bootstrap"
import { OrgIconSmall } from "./StyledEditProfileComponents"
import { FollowedItemRow } from "./FollowedItemRow"

export function FollowUserCard({
  profileId,
  confirmUnfollow
}: {
  profileId: string
  confirmUnfollow?: boolean
}) {
  const { result: profile, loading } = usePublicProfile(profileId)
  const { t } = useTranslation("profile")

  if (loading) {
    return (
      <div className={`fs-3 lh-lg`}>
        <Row className="align-items-center justify-content-between g-0 w-100">
          <Spinner animation="border" className="mx-auto" />
        </Row>
        <hr className={`mt-3`} />
      </div>
    )
  }

  const { fullName, profileImage, public: isPublic } = profile || {}
  const displayName = isPublic && fullName ? fullName : t("anonymousUser")

  return (
    <FollowedItemRow
      lead={
        <>
          <OrgIconSmall className="m-0" profileImage={profileImage} />
          {isPublic ? (
            <Internal href={`/profile?id=${profileId}`}>{displayName}</Internal>
          ) : (
            <span>{displayName}</span>
          )}
        </>
      }
      action={
        isPublic ? (
          <FollowUserButton
            profileId={profileId}
            confirmUnfollow={confirmUnfollow}
          />
        ) : undefined
      }
    />
  )
}
