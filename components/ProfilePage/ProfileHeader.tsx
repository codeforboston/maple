import { Dispatch, SetStateAction } from "react"
import { flags } from "components/featureFlags"
import { FollowButton } from "components/shared/FollowButton"
import { Col, Row, Stack } from "../bootstrap"
import { Profile } from "../db"
import { EditProfileButton } from "./ProfileButtons"
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
}) => {
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

  return (
    <>
      {isMobile ? (
        <ProfileHeaderMobile
          isOrg={isOrg}
          isProfilePublic={isProfilePublic}
          setIsProfilePublic={setIsProfilePublic}
          isUser={isUser}
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
                        // isProfilePublic={isProfilePublic}
                        // setIsProfilePublic={setIsProfilePublic}
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
                      // isProfilePublic={isProfilePublic}
                      // setIsProfilePublic={setIsProfilePublic}
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
  isProfilePublic,
  setIsProfilePublic,
  isUser,
  orgImageSrc,
  profile
}: {
  isOrg: boolean
  isProfilePublic: boolean
  setIsProfilePublic: Dispatch<SetStateAction<boolean>>
  isUser: boolean
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
      {isUser && (
        <EditProfileButton
          isOrg={isOrg}
          // isProfilePublic={isProfilePublic}
          // setIsProfilePublic={setIsProfilePublic}
        />
      )}
    </Header>
  )
}
