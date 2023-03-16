import { ProfileAboutSection } from "./ProfileAboutSection"
import { useCallback } from "react"
import { useMediaQuery } from "usehooks-ts"
import { useAuth } from "../auth"
import { Col, Row, Spinner } from "../bootstrap"
import { usePublicProfile, usePublishedTestimonyListing } from "../db"
import ViewTestimony from "../UserTestimonies/ViewTestimony"
import { ProfileLegislators } from "./ProfileLegislators"
import { StyledContainer } from "./StyledProfileComponents"
import { ProfileHeader } from "./ProfileHeader"
import { VerifyAccountSection } from "./VerifyAccountSection"

export function ProfilePage( profileprops : {id: string, verifyisorg? : boolean}) {
  const { user } = useAuth()
  const { result: profile, loading } = usePublicProfile(profileprops.id, profileprops.verifyisorg)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const isUser = user?.uid === profileprops.id

  const testimony = usePublishedTestimonyListing({
    uid: profileprops.id
  })

  const { items } = testimony

  const refreshtable = useCallback(() => {
    items.execute()
  }, [items])

  const isOrganization: boolean = profile?.role === "organization" || false
  const displayName = profile?.displayName
  const profileImage = profile?.profileImage

  return (
    <>
      {loading ? (
        <Row>
          <Spinner animation="border" className="mx-auto" />
        </Row>
      ) : (
        <>
          {isUser && (
            <StyledContainer
              fluid
              className={`text-white text-center text-middle`}
              style={{
                fontFamily: "nunito",
                fontSize: "20px",
                position: "absolute",
                height: 0,
                paddingBottom: "2rem",
                backgroundColor: "var(--bs-orange)"
              }}
            >
              <p>Currently viewing your profile</p>
            </StyledContainer>
          )}
          <StyledContainer>
            <ProfileHeader
              displayName={displayName}
              isUser={isUser}
              isOrganization={isOrganization || false}
              profileImage={profileImage || "/profile-org-icon.svg"}
              isMobile={isMobile}
              uid={user?.uid}
              orgId={profileprops.id}
            />

            {isUser && !user.emailVerified ? (
              <VerifyAccountSection user={user} />
            ) : null}

            <Row className={`mb-5`}>
              <Col className={`${isMobile && "mb-4"}`}>
                <ProfileAboutSection profile={profile} isMobile={isMobile} />
              </Col>
              {!isOrganization && (
                <Col xs={12} md={5}>
                  <ProfileLegislators
                    rep={profile?.representative}
                    senator={profile?.senator}
                    className={`h-100`}
                  />
                </Col>
              )}
            </Row>

            <Row>
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
    </>
  )
}
