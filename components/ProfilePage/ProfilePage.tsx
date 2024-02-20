import { PendingUpgradeBanner } from "components/PendingUpgradeBanner"
import { useTranslation } from "next-i18next"
import ErrorPage from "next/error"
import { useEffect, useState } from "react"
import { useMediaQuery } from "usehooks-ts"
import ViewTestimony from "../TestimonyCard/ViewTestimony"
import { useAuth } from "../auth"
import { Col, Row, Spinner } from "../bootstrap"
import { usePublicProfile, usePublishedTestimonyListing } from "../db"
import { Banner } from "../shared/StyledSharedComponents"
import { ProfileAboutSection } from "./ProfileAboutSection"
import { ProfileHeader } from "./ProfileHeader"
import { ProfileLegislators } from "./ProfileLegislators"
import { StyledContainer } from "./StyledProfileComponents"
import { VerifyAccountSection } from "./VerifyAccountSection"

export function ProfilePage(profileprops: {
  id: string
  verifyisorg?: boolean
}) {
  const { user, claims } = useAuth()
  const { result: profile, loading } = usePublicProfile(
    profileprops.id,
    profileprops.verifyisorg
  )
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isUser = user?.uid === profileprops.id
  const isPendingUpgrade = claims?.role === "pendingUpgrade"
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
              {isUser ? (
                isPendingUpgrade ? (
                  <PendingUpgradeBanner />
                ) : (
                  <>
                    <Banner> {t("content.viewingProfile")} </Banner>
                    <Banner>
                      {isProfilePublic
                        ? t("content.publicProfile")
                        : t("content.privateProfile")}
                    </Banner>
                  </>
                )
              ) : null}

              <StyledContainer>
                <ProfileHeader
                  isMobile={isMobile}
                  uid={user?.uid}
                  profileId={profileprops.id}
                  isUser={isUser}
                  isOrg={isOrg}
                  isProfilePublic={isProfilePublic}
                  onProfilePublicityChanged={onProfilePublicityChanged}
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
