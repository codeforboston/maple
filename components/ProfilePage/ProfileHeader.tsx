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
import { FollowButton } from "components/shared/FollowButton"

export const ProfileHeader = ({
  isUser,
  isOrg,
  isMobile,
  profile,
  profileid,
  uid
}: {
  isUser: boolean
  isOrg: boolean
  isMobile: boolean
  profile: Profile
  profileid: string
  uid?: string
}) => {
  const orgImageSrc = profile.profileImage
    ? profile.profileImage
    : "/profile-org-icon.svg"

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
            {profile.fullName}
          </ProfileDisplayName>
          {isOrg && (
            <>
              {isUser ? (
                <EditProfileButton isOrg={isOrg} isMobile={isMobile} />
              ) : (
                <FollowButton profileid={profileid} uid={uid} />
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
