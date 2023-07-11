import { useState, useEffect } from "react"
import { ProfileAboutSection } from "./ProfileAboutSection"
import { useMediaQuery } from "usehooks-ts"
import { useAuth } from "../auth"
import { Col, Row, Spinner } from "../bootstrap"
import {
  ProfileMember,
  usePublicProfile,
  usePublishedTestimonyListing
} from "../db"
import { Banner } from "../shared/StyledSharedComponents"
import ViewTestimony from "../TestimonyCard/ViewTestimony"
import { ProfileLegislators } from "./ProfileLegislators"
import { StyledContainer } from "./StyledProfileComponents"
import { ProfileHeader } from "./ProfileHeader"
import ErrorPage from "next/error"
import { VerifyAccountSection } from "./VerifyAccountSection"
import { useTranslation } from "next-i18next"

export function ProfilePage(profileprops: {
  id: string
  verifyisorg?: boolean
}) {
  const { user } = useAuth()
  const { result: profile, loading } = usePublicProfile(
    profileprops.id,
    profileprops.verifyisorg
  )

  const rep: ProfileMember = {
    district: "district",
    id: "id",
    name: "representative person"
  }

  const isMobile = useMediaQuery("(max-width: 768px)")
  const isUser = user?.uid === profileprops.id
  const isOrg: boolean =
    profile?.role === "organization" ||
    profile?.role === "pendingUpgrade" ||
    false

  const [isProfilePublic, setIsProfilePublic] = useState<boolean>(false)

  useEffect(() => {
    setIsProfilePublic(profile?.public ? profile.public : false)
  }, [profile?.public])

  const testimony = usePublishedTestimonyListing({
    uid: profileprops.id
  })

  const { t } = useTranslation("profile")

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
                  setIsProfilePublic={setIsProfilePublic}
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
