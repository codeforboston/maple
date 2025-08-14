import { functions } from "components/firebase"
import { httpsCallable } from "firebase/functions"
import type {
  GetFollowersRequest,
  GetFollowersResponse
} from "functions/src/subscriptions/getFollowers"
import { useTranslation } from "next-i18next"
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react"
import { useAuth } from "../auth"
import { usePublicProfile } from "components/db"
import { Internal } from "components/links"
import { FollowUserButton } from "components/shared/FollowButton"
import React from "react"
import { Col, Row, Spinner, Stack } from "../bootstrap"
import { TitledSectionCard } from "../shared"
import { OrgIconSmall } from "./StyledEditProfileComponents"

export const FollowersTab = ({
  className,
  setFollowerCount
}: {
  className?: string
  setFollowerCount: Dispatch<SetStateAction<number | null>>
}) => {
  const uid = useAuth().user?.uid
  const [followerIds, setFollowerIds] = useState<string[]>([])
  const { t } = useTranslation("editProfile")

  useEffect(() => {
    const fetchFollowers = async (uid: string) => {
      try {
        const { data: followerIds } = await httpsCallable<
          GetFollowersRequest,
          GetFollowersResponse
        >(
          functions,
          "getFollowers"
        )({ uid })
        setFollowerIds(followerIds)
        setFollowerCount(followerIds.length)
      } catch (err) {
        console.error("Error fetching followerIds", err)
        return
      }
    }
    if (uid) fetchFollowers(uid)
  }, [uid])
  return (
    <TitledSectionCard className={className}>
      <div className={`mx-4 mt-3 d-flex flex-column gap-3`}>
        <Stack>
          <h2>{t("follow.your_followers")}</h2>
          <p className="mt-0 text-muted">
            {t("follow.follower_info_disclaimer")}
          </p>
          <div className="mt-3">
            {followerIds.map((profileId, i) => (
              <FollowerCard key={i} profileId={profileId} />
            ))}
          </div>
        </Stack>
      </div>
    </TitledSectionCard>
  )
}

const FollowerCard = ({ profileId }: { profileId: string }) => {
  const { result: profile, loading } = usePublicProfile(profileId)
  const { t } = useTranslation("profile")
  if (loading) {
    return (
      <FollowerCardWrapper>
        <Spinner animation="border" className="mx-auto" />
      </FollowerCardWrapper>
    )
  }
  const { fullName, profileImage, public: isPublic } = profile || {}
  const displayName = isPublic && fullName ? fullName : t("anonymousUser")
  return (
    <FollowerCardWrapper>
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
    </FollowerCardWrapper>
  )
}

const FollowerCardWrapper = ({ children }: { children: ReactNode }) => (
  <div className={`fs-3 lh-lg`}>
    <Row className="align-items-center justify-content-between g-0 w-100">
      {children}
    </Row>
    <hr className={`mt-3`} />
  </div>
)
