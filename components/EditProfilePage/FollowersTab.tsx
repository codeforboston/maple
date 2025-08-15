import { functions } from "components/firebase"
import { httpsCallable } from "firebase/functions"
import { useTranslation } from "next-i18next"
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react"
import { useAuth } from "../auth"
import { Profile, usePublicProfile } from "components/db"
import { Internal } from "components/links"
import { FollowUserButton } from "components/shared/FollowButton"
import React from "react"
import { Col, Row, Spinner, Stack, Alert } from "../bootstrap"
import { TitledSectionCard } from "../shared"
import { OrgIconSmall } from "./StyledEditProfileComponents"

type ProfileWithId = Profile & { profileId: string }

export const FollowersTab = ({
  className,
  setFollowerCount
}: {
  className?: string
  setFollowerCount: Dispatch<SetStateAction<number | null>>
}) => {
  const uid = useAuth().user?.uid
  const [followers, setFollowers] = useState<ProfileWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation("editProfile")

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const { data: followerIds } = await httpsCallable<
          void,
          ProfileWithId[]
        >(functions, "getFollowers")()
        setFollowers(followerIds)
        setFollowerCount(followerIds.length)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching followerIds", err)
        setError("Error fetching followers.")
        setLoading(false)
        return
      }
    }
    if (uid) fetchFollowers()
  }, [uid])
  return (
    <TitledSectionCard className={className}>
      <div className="mx-4 mt-3 d-flex flex-column gap-3">
        <Stack>
          <h2>{t("follow.your_followers")}</h2>
          <p className="mt-0 text-muted">
            {t("follow.follower_info_disclaimer")}
          </p>
          <div className="mt-3">
            {error ? (
              <Alert variant="danger">{error}</Alert>
            ) : loading ? (
              <Spinner animation="border" className="mx-auto" />
            ) : (
              followers.map((profile, i) => (
                <FollowerCard key={i} {...profile} />
              ))
            )}
          </div>
        </Stack>
      </div>
    </TitledSectionCard>
  )
}

const FollowerCard = ({
  profileId,
  fullName,
  profileImage,
  public: isPublic
}: ProfileWithId) => {
  const { t } = useTranslation("profile")
  const displayName = isPublic && fullName ? fullName : t("anonymousUser")
  return (
    <div className={`fs-3 lh-lg`}>
      <Row className="align-items-center justify-content-between g-0 w-100">
        <Col className="d-flex align-items-center flex-grow-1 p-0 text-start">
          <OrgIconSmall
            className="mr-4 mt-0 mb-0 ms-0"
            profileImage={profileImage}
          />
          {isPublic ? (
            <Internal href={`/profile?id=${profileId}`}>{displayName}</Internal>
          ) : (
            <span>{displayName}</span>
          )}
        </Col>
        {isPublic ? (
          <Col
            xs="auto"
            className="d-flex justify-content-end ms-auto text-end p-0"
          >
            <FollowUserButton profileId={profileId} />
          </Col>
        ) : (
          <></>
        )}
      </Row>
      <hr className={`mt-3`} />
    </div>
  )
}
