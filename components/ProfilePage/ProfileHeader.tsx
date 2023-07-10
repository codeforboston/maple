import { Dispatch, SetStateAction } from "react"
import { flags } from "components/featureFlags"
import { FollowButton } from "components/shared/FollowButton"
import { Col, Row, Stack } from "../bootstrap"
import { Profile } from "../db"
import { EditProfileButton } from "./EditProfileButton"
import { OrgContactInfo } from "./OrgContactInfo"
import {
  Header,
  OrgIconLarge,
  OrgIconSmall,
  ProfileDisplayName,
  ProfileDisplayNameSmall,
  UserIcon,
  UserIconSmall
} from "./StyledProfileComponents"

export const ProfileHeader = ({
  isMobile,
  isOrg,
  isProfilePublic,
  setIsProfilePublic,
  isUser,
  profile,
  profileid
}: {
  isMobile: boolean
  isOrg: boolean
  isProfilePublic: boolean
  setIsProfilePublic: Dispatch<SetStateAction<boolean>>
  isUser: boolean
  profile: Profile
  profileid: string
}) => {
  const orgImageSrc = profile.profileImage
    ? profile.profileImage
    : "/profile-org-icon.svg"

  return (
    <>
      {isMobile ? (
        <ProfileHeaderMobile
          isOrg={isOrg}
          orgImageSrc={orgImageSrc}
          profile={profile}
        />
      ) : (
        <Header className={`gx-0 edit-profile-header`}>
          <Row xs={"auto"}>
            {isOrg ? (
              <Col xs={"auto"} className={"col-auto"}>
                <OrgIconLarge src={orgImageSrc} />
              </Col>
            ) : (
              <Col>
                <UserIcon src="./profile-individual-icon.svg" />
              </Col>
            )}

            <Col>
              <Stack gap={0}>
                <ProfileDisplayName className={`overflow-hidden`}>
                  {profile.fullName}
                </ProfileDisplayName>

                {isOrg && (
                  <>
                    {isUser ? (
                      <EditProfileButton
                        isOrg={isOrg}
                        isProfilePublic={isProfilePublic}
                        setIsProfilePublic={setIsProfilePublic}
                      />
                    ) : (
                      <>
                        {flags().followOrg && (
                          <FollowButton profileid={profileid} />
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
                <div>
                  {isUser && (
                    <EditProfileButton
                      isOrg={isOrg}
                      isProfilePublic={isProfilePublic}
                      setIsProfilePublic={setIsProfilePublic}
                    />
                  )}
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
  isOrg,
  orgImageSrc,
  profile
}: {
  isOrg: boolean
  orgImageSrc: string
  profile: Profile
}) {
  const yo = 1

  return (
    <Header className={``}>
      <Col className={`d-flex align-items-center`}>
        {isOrg ? (
          <OrgIconSmall className={``} src={orgImageSrc} />
        ) : (
          <UserIconSmall src="./profile-individual-icon.svg" />
        )}

        <ProfileDisplayNameSmall className={`ms-auto overflow-hidden`}>
          {profile.fullName}
        </ProfileDisplayNameSmall>
      </Col>
      Mobile Hello World
    </Header>
  )
}
