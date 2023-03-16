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
import { Button, Col } from "../bootstrap"
import { useState, useEffect } from "react"
import { Header, StyledImage, ProfileDisplayName, OrgIconLarge, UserIcon } from "./StyledProfileComponents"
import { EditProfileButton } from "./EditProfileButton"

export const ProfileHeader = ({
    displayName,
    isUser,
    isOrganization,
    profileImage,
    isMobile,
    uid,
    orgId
  }: {
    displayName?: string
    isUser: boolean
    isOrganization: boolean
    profileImage?: string
    isMobile: boolean
    uid?: string
    orgId: string
  }) => {
    const topicName = `org-${orgId}`
    const subscriptionRef = collection(
      firestore,
      `/users/${uid}/activeTopicSubscriptions/`
    )
    const [queryResult, setQueryResult] = useState("")
  
    const orgQuery = async () => {
      const q = query(subscriptionRef, where("topicName", "==", `org-${orgId}`))
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
        orgId: orgId,
        type: "org"
      })
  
      setQueryResult(topicName)
    }
  
    const handleUnfollowClick = async () => {
      await deleteDoc(doc(subscriptionRef, topicName))
  
      setQueryResult("")
    }
  
    return (
      <Header className={`d-flex edit-profile-header`}>
        {isOrganization ? (
          <Col xs={"auto"} className={"col-auto"}>
            <OrgIconLarge className={`col d-none d-sm-flex`} src={profileImage} />
          </Col>
        ) : (
          <Col xs={"auto"} className={"col-auto"}>
            <UserIcon />
          </Col>
        )}
        <Col>
          <div>
            <ProfileDisplayName className={`overflow-hidden`}>
              {displayName ? `${displayName}` : "Anonymous User"}
            </ProfileDisplayName>
            {isOrganization ? (
              <Col>
                <Button
                  className={`btn btn-primary btn-sm py-1 ${
                    uid ? "" : "visually-hidden"
                  }`}
                  onClick={queryResult ? handleUnfollowClick : handleFollowClick}
                >
                  {queryResult ? "Following" : "Follow"}
                  {queryResult ? (
                    <StyledImage src="/check-white.svg" alt="checkmark" />
                  ) : null}
                </Button>
              </Col>
            ) : (
              <></>
            )}
          </div>
        </Col>
        {isUser && <EditProfileButton isMobile={isMobile} />}
      </Header>
    )
  }
  