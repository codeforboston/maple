import { ProfileAboutSection } from "./ProfileAboutSection"
import { useMediaQuery } from "usehooks-ts"
import { useAuth } from "../auth"
import { Col, Row, Spinner } from "../bootstrap"
import { usePublicProfile, usePublishedTestimonyListing } from "../db"
import ViewTestimony from "../UserTestimonies/ViewTestimony"
import { ProfileLegislators } from "./ProfileLegislators"
import { StyledContainer, Banner } from "./StyledProfileComponents"
import { ProfileHeader } from "./ProfileHeader"
import ErrorPage from "next/error"
import { VerifyAccountSection } from "./VerifyAccountSection"
import { Profile, ProfileMember, SocialLinks, Testimony } from "../db"

export function ProfilePage( profileprops : {id: string, verifyisorg? : boolean}) {
  const { user } = useAuth()
  // const { result: profile, loading } = usePublicProfile(profileprops.id, profileprops.verifyisorg)
  
  const rep:ProfileMember = { district:"district", id:"id", name:"representative person"}

  const senator:ProfileMember = { district:"sedistrict", id:"isdfd", name:"senator person"}
  const socials:SocialLinks = {}
  const profile:Profile = {
    role: "organization",
    displayName: "display name",
    fullName: "Kelly yen",
    representative: rep,
    senator: senator,
    public: true,
    about: "This is my about",
    social: socials,
    profileImage: "",
    billsFollowing: [],
    requestingToBeOrg: false
  } 

  const loading = false
  
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isUser = user?.uid === profileprops.id
  const isOrganization: boolean = profile?.role === "organization" || false
  
  const testimony = usePublishedTestimonyListing({
    uid: profileprops.id
  })  
  

  return (
    <>
      {profile ? (
      <>
          {loading ? (
        <Row>
          <Spinner animation="border" className="mx-auto" />
        </Row>
      ) : (
        <>
          {isUser && (
            <Banner>
              Currently viewing your profile
            </Banner>
          )}
          <StyledContainer>
            <ProfileHeader
              isUser={isUser}
              isOrganization={isOrganization || false}
              isMobile={isMobile}
              uid={user?.uid}
              profileid={profileprops.id}
              profile={profile}
            />

            {isUser && !user.emailVerified ? (
              <VerifyAccountSection user={user} />
            ) : null}

            <Row>
              <Col className={`${isMobile && "mb-4"}`}>
                <ProfileAboutSection profile={profile} isMobile={isMobile} />
              </Col>
              {!isOrganization && (
                <Col xs={12} md={4}>
                  <ProfileLegislators
                    rep={profile?.representative}
                    senator={profile?.senator}
                    className={`h-100`}
                  />
                </Col>
              )}
            </Row>

            <Row className="pt-4">
              <Col xs={12}>
                <ViewTestimony
                  {...testimony}
                  showControls={isUser}
                  showBillNumber
                  className="mb-4"
                />
              </Col>
            </Row>
          </StyledContainer>
        </>
      )}
      
      </> ) : (<ErrorPage statusCode={404} withDarkMode={false} />)}
    </>
  )
}
