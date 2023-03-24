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
  ProfileDisplayName,
  OrgIconLarge,
  UserIcon
} from "./StyledProfileComponents"
import { EditProfileButton } from "./EditProfileButton"
import { OrgContactInfo } from "./OrgContactInfo"
import { Profile } from "../db"
import { FollowButton } from "./FollowButton"

export const ProfileHeader = ({
  isUser,
  isOrg,
  isMobile,
  uid,
  profileid,
  profile
}: {
  isUser: boolean
  isOrg: boolean
  isMobile: boolean
  uid?: string
  profileid: string
  profile: Profile
}) => {
  const orgImageSrc = profile.profileImage
    ? profile.profileImage
    : "/profile-org-icon.svg"
  const topicName = `org-${profileid}`
  const subscriptionRef = collection(
    firestore,
    `/users/${uid}/activeTopicSubscriptions/`
  )
  const [queryResult, setQueryResult] = useState("")

  const orgQuery = async () => {
    const q = query(
      subscriptionRef,
      where("topicName", "==", `org-${profileid}`)
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

  const handleFollowClick = async () => {
    await setDoc(doc(subscriptionRef, topicName), {
      topicName: topicName,
      uid: uid,
      profileid: profileid,
      type: "org"
    })

    setQueryResult(topicName)
  }

  const handleUnfollowClick = async () => {
    await deleteDoc(doc(subscriptionRef, topicName))

    setQueryResult("")
  }

  return (
    <Header className={`gx-0 edit-profile-header`}>
      {isOrg ? (
        <Col xs={"auto"} className={"col-auto"}>
          <OrgIconLarge className={`col d-none d-sm-flex`} src={orgImageSrc} />
        </Col>
      ) : (
        <Col xs={"auto"}>
          <UserIcon src="./profile-individual-icon.svg" />
        </Col>
      )}
      <Col>
        <Stack gap={2}>
          <ProfileDisplayName className={`overflow-hidden`}>
            {profile.displayName}
          </ProfileDisplayName>
          {isOrg && (
            <>
              {isUser ? (
                <EditProfileButton isOrg={isOrg} isMobile={isMobile} />
              ) : (
                <FollowButton
                  onFollowClick={() => handleFollowClick()}
                  onUnfollowClick={() => handleUnfollowClick()}
                  isMobile={isMobile}
                  isFollowing={queryResult}
                />
              )}
            </>
          )}
        </Stack>
      </Col>
      <Col>
        {isOrg ? (
          <OrgContactInfo profile={profile} />
        ) : (
          <div className="justify-content-end d-flex">
            {isUser && <EditProfileButton isOrg={isOrg} isMobile={isMobile} />}
          </div>
        )}
      </Col>
    </Header>
  )
}
