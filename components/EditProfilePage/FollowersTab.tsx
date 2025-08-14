import { functions } from "components/firebase"
import { httpsCallable } from "firebase/functions"
import type {
  GetFollowersRequest,
  GetFollowersResponse
} from "functions/src/subscriptions/getFollowers"
import { useTranslation } from "next-i18next"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useAuth } from "../auth"
import { usePublicProfile } from "components/db"
import { Internal } from "components/links"
import { FollowUserButton } from "components/shared/FollowButton"
import React from "react"
import { Col, Row, Spinner, Stack } from "../bootstrap"
import { TitledSectionCard } from "../shared"
import { OrgIconSmall } from "./StyledEditProfileComponents"

export type FollowUserData = {
  profileId: string
  fullName?: string
}

export const getFollowers = httpsCallable<
  GetFollowersRequest,
  GetFollowersResponse
>(functions, "getFollowers")

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
        const response = await getFollowers({ uid })
        setFollowerIds(response.data)
        setFollowerCount(response.data.length)
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

function FollowerCard({ profileId }: { profileId: string }) {
  const { result: profile, loading } = usePublicProfile(profileId)
  const { profileImage, fullName } = profile || {}
  return (
    <div className={`fs-3 lh-lg`}>
      <Row className="align-items-center justify-content-between g-0 w-100">
        {loading ? (
          <Spinner animation="border" className="mx-auto" />
        ) : (
          <>
            <Col className="d-flex align-items-center flex-grow-1 p-0 text-start">
              <OrgIconSmall
                className="mr-4 mt-0 mb-0 ms-0"
                profileImage={profileImage}
              />
              <Internal href={`/profile?id=${profileId}`}>{fullName}</Internal>
            </Col>
            <Col
              xs="auto"
              className="d-flex justify-content-end ms-auto text-end p-0"
            >
              <FollowUserButton
                profileId={profileId}
                fullName={fullName}
                modalConfig={{ confirmUnfollow: true }}
              />
            </Col>
          </>
        )}
      </Row>
      <hr className={`mt-3`} />
    </div>
  )
}
