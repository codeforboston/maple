import { useTranslation } from "next-i18next"
import { useState, useEffect } from "react"
import { useMediaQuery } from "usehooks-ts"
import { useAuth } from "../auth"
import { Col, Row, Spinner } from "../bootstrap"
import { usePublicProfile, usePublishedTestimonyListing } from "../db"
import { Banner } from "../shared/StyledSharedComponents"
import ViewTestimony from "../TestimonyCard/ViewTestimony"
import { ProfileAboutSection } from "./ProfileAboutSection"
import { ProfileLegislators } from "./ProfileLegislators"
import { StyledContainer } from "./StyledProfileComponents"
import { ProfileHeader } from "./ProfileHeader"
import { VerifyAccountSection } from "./VerifyAccountSection"
import ErrorPage from "next/error"

export function ProfilePage(profileprops: {
  id: string
  verifyisorg?: boolean
}) {
  const { user } = useAuth()
  const { result: profile, loading } = usePublicProfile(
    profileprops.id,
    profileprops.verifyisorg
  )
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isUser = user?.uid === profileprops.id
  const isOrg: boolean =
    profile?.role === "organization" ||
    profile?.role === "pendingUpgrade" ||
    false
  const testimony = usePublishedTestimonyListing({
    uid: profileprops.id
  })
  const { t } = useTranslation("profile")

  const [isProfilePublic, onProfilePublicityChanged] = useState<
    boolean | undefined
  >(false)

  /* profile?.public will not cause the <Banner> component to properly rerender 
     to show current "publicity" when the "Make Public/Private" button is used.  
     The leads to the <Banner> displaying incorrect/unsynced information. 
     
     A state variable is used to enforce a rerender on profile update when publicity
     button is used.

     see variable: bannerContent, onProfilePublicityChanged
   */

  useEffect(() => {
    onProfilePublicityChanged(profile?.public)
  }, [profile?.public])

  const bannerContent = isProfilePublic ? (
    <Banner> {t("content.publicProfile")} </Banner>
  ) : (
    <Banner> {t("content.privateProfile")} </Banner>
  )

  return (
    <>
      {loading ? (
        <Row>
          <Spinner animation="border" className="mx-auto" />
        </Row>
      ) : (
        <>
          {profile ? (
            <>
              {isUser && <Banner> {t("content.viewingProfile")} </Banner>}
              {isUser && bannerContent}
              <StyledContainer>
                <ProfileHeader
                  isMobile={isMobile}
                  isOrg={isOrg || false}
                  isProfilePublic={isProfilePublic}
                  onProfilePublicityChanged={onProfilePublicityChanged}
                  isUser={isUser}
                  profileid={profileprops.id}
                  profile={profile}
                />

                {isUser && !user.emailVerified ? (
                  <Row>
                    <Col>
                      <VerifyAccountSection className="mb-4" user={user} />
                    </Col>
                  </Row>
                ) : null}

                <Row>
                  <Col className={`${isMobile && "mb-4"}`}>
                    <ProfileAboutSection
                      isOrg={isOrg}
                      profile={profile}
                      isMobile={isMobile}
                    />
                  </Col>
                  {!isOrg && (
                    <Col xs={12} md={5}>
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
                      onProfilePage={true}
                      className="mb-4"
                      isOrg={isOrg}
                    />
                  </Col>
                </Row>
              </StyledContainer>
            </>
          ) : (
            <ErrorPage statusCode={404} withDarkMode={false} />
          )}
        </>
      )}
    </>
  )
}
