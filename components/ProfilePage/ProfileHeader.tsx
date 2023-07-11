import { Dispatch, SetStateAction } from "react"
import { FollowButton } from "components/shared/FollowButton"
import { Col, Row, Stack } from "../bootstrap"
import { Profile } from "../db"
import { EditProfileButton, MakePublicButton } from "./ProfileButtons"
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
          isMobile={isMobile}
          isOrg={isOrg}
          isProfilePublic={isProfilePublic}
          setIsProfilePublic={setIsProfilePublic}
          isUser={isUser}
          orgImageSrc={orgImageSrc}
          profile={profile}
          profileid={profileid}
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
                <div className={`d-flex w-100 justify-content-end`}>
                  <div className={`d-flex flex-column`}>
                    {isUser && (
                      <>
                        <EditProfileButton />
                        <MakePublicButton
                          isMobile={isMobile}
                          isOrg={isOrg}
                          isProfilePublic={isProfilePublic}
                          setIsProfilePublic={setIsProfilePublic}
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
  setIsProfilePublic,
  isUser,
  orgImageSrc,
  profile,
  profileid
}: {
  isMobile: boolean
  isOrg: boolean
  isProfilePublic: boolean
  setIsProfilePublic: Dispatch<SetStateAction<boolean>>
  isUser: boolean
  orgImageSrc: string
  profile: Profile
  profileid: string
}) {
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
      {isUser && (
        <>
          <EditProfileButton />
          {!isOrg && (
            <MakePublicButton
              isMobile={isMobile}
              isOrg={isOrg}
              isProfilePublic={isProfilePublic}
              setIsProfilePublic={setIsProfilePublic}
            />
          )}
        </>
      )}
      {isOrg && !isUser && <FollowButton profileid={profileid} />}
      {isOrg && <OrgContactInfo profile={profile} />}
    </Header>
  )
}
