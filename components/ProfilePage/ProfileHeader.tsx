import { Col, Row, Stack } from "../bootstrap"
import {
  Header,
  OrgIconLarge,
  OrgIconSmall,
  ProfileDisplayName,
  ProfileDisplayNameSmall,
  UserIconLarge,
  UserIconSmall
} from "./StyledProfileComponents"

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

  const orgImageSrc = profile.profileImage
    ? profile.profileImage
    : "/profile-org-icon.svg"

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
          profileId={profileId}
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
  orgImageSrc,
  profile,
  profileId,
  userImageSrc,
  uid
}: {
  isMobile: boolean
  isOrg: boolean
  isProfilePublic: boolean | undefined
  onProfilePublicityChanged: (isPublic: boolean) => void
  isUser: boolean
  orgImageSrc: string
  profile: Profile
  profileId: string
  userImageSrc: string
  uid?: string
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
      {isOrg && !isUser && <FollowButton isMobile={isMobile} />}
      {isOrg && <OrgContactInfo profile={profile} />}
    </Header>
  )
}
