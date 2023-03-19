import { ProfileAboutSection } from "./ProfileAboutSection"
import { useMediaQuery } from "usehooks-ts"
import { useAuth } from "../auth"
import { Col, Row, Spinner } from "../bootstrap"
import { usePublicProfile, usePublishedTestimonyListing } from "../db"
import ViewTestimony from "../TestimonyCard/ViewTestimony"
import { ProfileLegislators } from "./ProfileLegislators"
import { StyledContainer, Banner } from "./StyledProfileComponents"
import { ProfileHeader } from "./ProfileHeader"
import ErrorPage from "next/error"
import { VerifyAccountSection } from "./VerifyAccountSection"
import { Profile, ProfileMember, SocialLinks, Testimony, ContactInfo} from "../db"

export function ProfilePage( profileprops : {id: string, verifyisorg? : boolean}) {
  const { user } = useAuth()
  // const { result: profile, loading } = usePublicProfile(profileprops.id, profileprops.verifyisorg)
  
  const rep:ProfileMember = { district:"district", id:"id", name:"representative person"}

  const senator:ProfileMember = { district:"sedistrict", id:"isdfd", name:"senator person"}
  const socials:SocialLinks = {instagram:"myinstagram", twitter:"twitter", fb:"fb", linkedIn:"linked"}
  const contactinfo:ContactInfo = {email:"email@olin.edu", phone:"999-222-1121", website:"www.website.com"} 
  const profile:Profile = {
    role: "organization",
    displayName: "display name",
    fullName: "Kelly yen",
    representative: rep,
    senator: senator,
    public: true,
    about: "This is my about, this is a longer about paragraph about the organization, it's purpose, it's projects, and active initaitves. This is my about, this is a longer about paragraph about the organization, it's purpose, it's projects, and active initaitves. This is my about, this is a longer about paragraph about the organization, it's purpose, it's projects, and active initaitves. This is my about, this is a longer about paragraph about the organization, it's purpose, it's projects, and active initaitves. This is my about, this is a longer about paragraph about the organization, it's purpose, it's projects, and active initaitves",
    social: socials,
    profileImage: "",
    billsFollowing: [],
    requestingToBeOrg: false, 
    orgContactInfo:contactinfo, 
    location: "Boston, MA"

  } 

  const loading = false
  const isUser = true
  
  const isMobile = useMediaQuery("(max-width: 768px)")
  // const isUser = user?.uid === profileprops.id
  const isOrg: boolean = profile?.role === "organization" || false
  
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
              isOrg={isOrg || false}
              isMobile={isMobile}
              uid={user?.uid}
              profileid={profileprops.id}
              profile={profile}
            />

            {/* {isUser && !user.emailVerified ? (
              <VerifyAccountSection user={user} />
            ) : null} */}

            <Row>
              <Col className={`${isMobile && "mb-4"}`}>
                <ProfileAboutSection isOrg={isOrg} profile={profile} isMobile={isMobile} />
              </Col>
              {!isOrg && (
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
                  isUser={isUser}
                  showBillNumber
                  className="mb-4"
                  isOrg
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
