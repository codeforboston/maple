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
  ProfileDisplayName,
  UserIcon
} from "./StyledProfileComponents"

export const ProfileHeader = ({
  isOrg,
  isProfilePublic,
  setIsProfilePublic,
  isUser,
  profile,
  profileid
}: {
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
    <Header className={`gx-0 edit-profile-header`}>
      <Row xs={"auto"}>
        {isOrg ? (
          <Col xs={"auto"} className={"col-auto"}>
            <OrgIconLarge
              className={`col d-none d-sm-flex`}
              src={orgImageSrc}
            />
          </Col>
        ) : (
          <Col>
            <UserIcon src="./profile-individual-icon.svg" />
          </Col>
        )}

        <ProfileDisplayName
          className={`d-flex align-items-center overflow-hidden`}
        >
          {profile.fullName}
        </ProfileDisplayName>

        <Col className="d-flex align-items-center ms-auto my-auto">
          <Stack gap={0}>
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
  )
}
