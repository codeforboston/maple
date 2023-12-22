import { Col, Row, Stack } from "../bootstrap"
import {
  Header,
  ProfileDisplayName,
  ProfileDisplayNameSmall
} from "./StyledProfileComponents"
import { StyledProfileIcon } from "./StyledUserIcons"

import { flags } from "components/featureFlags"
import { FollowOrgButton } from "components/shared/FollowButton"
import { useTranslation } from "next-i18next"
import { Profile } from "../db"
import { FollowButton } from "./FollowButton" // TODO: move to /shared
import { OrgContactInfo } from "./OrgContactInfo"
import { EditProfileButton, MakePublicButton } from "./ProfileButtons"

export const ProfileHeader = ({
  isMobile,
  uid,
  profileId,
  profile,
  isUser,
  isOrg,
  isProfilePublic,
  onProfilePublicityChanged
}: {
  isMobile: boolean
  uid?: string
  profileId: string
  profile: Profile
  isUser: boolean
  isOrg: boolean
  isProfilePublic: boolean | undefined
  onProfilePublicityChanged: (isPublic: boolean) => void
}) => {
  const { t } = useTranslation("profile")

  return (
    <>
      {isMobile ? (
        <ProfileHeaderMobile
          isMobile={isMobile}
          isOrg={isOrg}
          isProfilePublic={isProfilePublic}
          onProfilePublicityChanged={onProfilePublicityChanged}
          isUser={isUser}
          profile={profile}
          profileId={profileId}
        />
      ) : (
        <Header className={`gx-0 edit-profile-header`}>
          <Row xs={"auto"}>
            <Col xs={"auto"} className={"col-auto"}>
              <StyledProfileIcon large />
            </Col>
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
                      <>
                        {flags().followOrg && (
                          <FollowOrgButton profileId={profileId} />
                        )}
                      </>
                    )}
                  </>
                )}
              </Stack>
            </Col>
            <Col className="d-flex align-items-center ms-auto">
              {isOrg ? (
                <OrgContactInfo profile={profile} />
              ) : (
                <div className={`d-flex w-100 justify-content-end`}>
                  <div className={`d-flex flex-column`}>
                    {isUser && (
                      <>
                        <EditProfileButton />
                        <MakePublicButton
                          isMobile={isMobile}
                          isOrg={isOrg}
                          isProfilePublic={isProfilePublic}
                          onProfilePublicityChanged={onProfilePublicityChanged}
                        />
                      </>
                    )}
                  </div>
                </div>
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
  profile,
  profileId,
  uid
}: {
  isMobile: boolean
  isOrg: boolean
  isProfilePublic: boolean | undefined
  onProfilePublicityChanged: (isPublic: boolean) => void
  isUser: boolean
  profile: Profile
  profileId: string
  uid?: string
}) {
  const { t } = useTranslation("profile")

  return (
    <Header className={``}>
      <Col className={`d-flex align-items-center justify-content-start`}>
        <StyledProfileIcon
          profileImage={profile.profileImage}
          isOrg={isOrg}
          className={`me-2`}
        />

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
      {isOrg && !isUser && <FollowButton isMobile={isMobile} />}
      {isOrg && <OrgContactInfo profile={profile} />}
    </Header>
  )
}
