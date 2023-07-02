import { Col, Stack } from "../bootstrap"
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
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from "../auth"

export const ProfileHeader = ({
  isUser,
  isOrg,
  isMobile,

  uid,
  profileId,
  profile
}: {
  isUser: boolean
  isOrg: boolean
  isMobile: boolean

  uid?: string
  profileId: string
  profile: Profile
  profileid: string
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

  const functions = getFunctions();
  const followBillFunction = httpsCallable(functions, 'followBill');
  const unfollowBillFunction = httpsCallable(functions, 'unfollowBill');

  const handleFollowClick = async () => {
    // ensure user is not null
    if (!user) {
      throw new Error("User not found");
    }
    
    try {
      if (!uid) {
        throw new Error("User not found");
      }
      const topicLookup = {
        profileId: profileId,
        type: "org"
      };
      const token = await user.getIdToken();
      const response = await followBillFunction({ topicLookup, token });
      if (response.data) {
        setQueryResult(topicName);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleUnfollowClick = async () => {
    // ensure user is not null
    if (!user) {
      throw new Error("User not found");
    }

    try {
      if (!uid) {
        throw new Error("User not found");
      }
      const topicLookup = {
        profileId: profileId,
        type: "org"
      };
      const token = await user.getIdToken();
      const response = await unfollowBillFunction({ topicLookup, token });
      if (response.data) {
        setQueryResult("");
      }
    } catch (error) {
      console.error(error);
    }
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
            {profile.fullName}
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
