import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where
} from "firebase/firestore"
import { firestore } from "../firebase"
import { Col, Stack } from "../bootstrap"
import { useState, useEffect } from "react"
import {
  Header,
  OrgIconLarge,
  OrgIconSmall,
  ProfileDisplayName,
  ProfileDisplayNameSmall,
  UserIconLarge,
  UserIconSmall
} from "./StyledProfileComponents"

import { EditProfileButton } from "./ProfileButtons"
import { OrgContactInfo } from "./OrgContactInfo"
import { Profile } from "../db"
import { FollowButton } from "./FollowButton"
import { getFunctions, httpsCallable } from "firebase/functions"
import { useAuth } from "../auth"
import { useTranslation } from "next-i18next"

export const ProfileHeader = ({
  isMobile,
  uid,
  profileId,
  profile

}: {
  isMobile: boolean
  uid?: string
  profileId: string
  profile: Profile
}) => {
  const { t } = useTranslation("profile")

  const orgImageSrc = profile.profileImage
    ? profile.profileImage
    : "/profile-org-icon.svg"
  const topicName = `org-${profileId}`
  const subscriptionRef = collection(
    firestore,
    `/users/${uid}/activeTopicSubscriptions/`
  )
  const [queryResult, setQueryResult] = useState("")

  const orgQuery = async () => {
    const q = query(
      subscriptionRef,
      where("topicName", "==", `org-${profileId}`)
    )
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(doc => {
      // doc.data() is never undefined for query doc snapshots
      setQueryResult(doc.data().topicName)
    })
  }

  useEffect(() => {
    uid ? orgQuery() : null
  })

  const { user } = useAuth()

  const functions = getFunctions()
  const followBillFunction = httpsCallable(functions, "followBill")
  const unfollowBillFunction = httpsCallable(functions, "unfollowBill")

  const handleFollowClick = async () => {
    // ensure user is not null
    if (!user) {
      throw new Error("User not found")
    }

    try {
      if (!uid) {
        throw new Error("User not found")
      }
      const topicLookup = {
        profileId: profileId,
        type: "org"
      }
      const token = await user.getIdToken()
      const response = await followBillFunction({ topicLookup, token })
      if (response.data) {
        setQueryResult(topicName)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleUnfollowClick = async () => {
    // ensure user is not null
    if (!user) {
      throw new Error("User not found")
    }

    try {
      if (!uid) {
        throw new Error("User not found")
      }
      const topicLookup = {
        profileId: profileId,
        type: "org"
      }
      const token = await user.getIdToken()
      const response = await unfollowBillFunction({ topicLookup, token })
      if (response.data) {
        setQueryResult("")
      }
    } catch (error) {
      console.error(error)
    }
  }

  const userImageSrc = profile.profileImage
    ? profile.profileImage
    : "/profile-individual-icon.svg"

  return (
    <>
      {isMobile ? (
        <ProfileHeaderMobile
          isMobile={isMobile}
          isOrg={isOrg}
          isProfilePublic={isProfilePublic}
          onProfilePublicityChanged={onProfilePublicityChanged}
          isUser={isUser}
          orgImageSrc={orgImageSrc}
          profile={profile}
          profileid={profileid}
          userImageSrc={userImageSrc}
        />
      ) : (
        <Header className={`gx-0 edit-profile-header`}>
          <Row xs={"auto"}>
            {isOrg ? (
              <Col xs={"auto"} className={"col-auto"}>
                <OrgIconLarge alt={t("orgIcon.large")} src={orgImageSrc} />
              </Col>
            ) : (
              <Col>
                <UserIconLarge alt={t("userIcon.large")} src={userImageSrc} />
              </Col>
            )}
            <Col className={isOrg ? `` : `d-flex`}>
              <Stack gap={0}>
                <ProfileDisplayName
                  className={`overflow-hidden ${
                    isOrg ? "" : "d-flex align-items-center"
                  }`}
                >
                  {profile.fullName}
                </ProfileDisplayName>
                {isOrg && (
                  <>
                    {isUser ? (
                      <div className={`d-flex w-100 justify-content-start`}>
                        <div className={`d-flex flex-row`}>
                          <EditProfileButton />
                        </div>
                      </div>
                    ) : (
                      <FollowButton profileid={profileid} />
                    )}
                  </>
                )}
              </Stack>
            </Col>
            <Col className="d-flex align-items-center ms-auto">
              {isOrg ? (
                <OrgContactInfo profile={profile} />
              ) : (

                <FollowButton
                  onFollowClick={() => handleFollowClick()}
                  onUnfollowClick={() => handleUnfollowClick()}
                  isMobile={isMobile}
                  isFollowing={queryResult}
                />
              )}
            </Col>
          </Row>
        </Header>
      )}
    </>
  )
}

function ProfileHeaderMobile({
  isMobile,
  isOrg,
  isProfilePublic,
  onProfilePublicityChanged,
  isUser,
  orgImageSrc,
  profile,
  profileid,
  userImageSrc
}: {
  isMobile: boolean
  isOrg: boolean
  isProfilePublic: boolean | undefined
  onProfilePublicityChanged: (isPublic: boolean) => void
  isUser: boolean
  orgImageSrc: string
  profile: Profile
  profileid: string
  userImageSrc: string
}) {
  const { t } = useTranslation("profile")

  return (
    <Header className={``}>
      <Col className={`d-flex align-items-center`}>
        {isOrg ? (
          <OrgIconSmall alt={t("orgIcon.small")} src={orgImageSrc} />
        ) : (
          <UserIconSmall alt={t("userIcon.small")} src={userImageSrc} />
        )}

        <ProfileDisplayNameSmall className={`ms-auto overflow-hidden`}>
          {profile.fullName}
        </ProfileDisplayNameSmall>
      </Col>
      {isUser && (
        <>
          <EditProfileButton />
          {!isOrg && (
            <MakePublicButton
              isMobile={isMobile}
              isOrg={isOrg}
              isProfilePublic={isProfilePublic}
              onProfilePublicityChanged={onProfilePublicityChanged}
            />
          )}
        </>
      )}
      {isOrg && !isUser && <FollowButton profileid={profileid} />}
      {isOrg && <OrgContactInfo profile={profile} />}
    </Header>
  )
}
