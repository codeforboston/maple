import { firestore } from "components/firebase"
import { PendingUpgradeBanner } from "components/PendingUpgradeBanner"
import { FollowContext, OrgFollowStatus } from "components/shared/FollowContext"
import { collectionGroup, getDocs, query, where } from "firebase/firestore"
import { useTranslation } from "next-i18next"
import ErrorPage from "next/error"
import { useEffect, useState } from "react"
import ViewTestimony from "../TestimonyCard/ViewTestimony"
import { useAuth } from "../auth"
import { Col, Container, Row, Spinner } from "../bootstrap"
import { usePublicProfile, usePublishedTestimonyListing } from "../db"
import { Banner } from "../shared/StyledSharedComponents"
import { OrgContactInfo } from "./OrgContactInfo"
import { ProfileAboutSection } from "./ProfileAboutSection"
import { ProfileHeader } from "./ProfileHeader"
import { ProfileLegislators } from "./ProfileLegislators"
import { VerifyAccountSection } from "./VerifyAccountSection"
import { Role } from "common/auth/types"

export function ProfilePage(profileprops: {
  id: string
  verifyisorg?: boolean
}) {
  const { user, claims } = useAuth()
  const { result: profile, loading } = usePublicProfile(
    profileprops.id,
    profileprops.verifyisorg
  )
  const isCurrentUser = user?.uid === profileprops.id
  const role: Role = profile?.role || "user"
  const isPendingUpgrade = claims?.role === "pendingUpgrade"
  const isOrg: boolean =
    role === "organization" || role === "pendingUpgrade" || false
  const testimony = usePublishedTestimonyListing({
    uid: profileprops.id
  })

  const [totalUserPubTestimony, setTotalUserPubTestimony] = useState<
    number | undefined
  >()

  useEffect(() => {
    const countPublishedTestimony = async () => {
      const pubTestRef = query(
        collectionGroup(firestore, "publishedTestimony"),
        where("authorUid", "==", profileprops.id)
      )
      const publishedTestimony = await getDocs(pubTestRef)
      setTotalUserPubTestimony(publishedTestimony.size)
    }

    countPublishedTestimony()
  }, [profileprops.id])

  const { t } = useTranslation("profile")
  const [followStatus, setFollowStatus] = useState<OrgFollowStatus>({})

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

  if (loading) {
    return (
      <Row>
        <Spinner animation="border" className="mx-auto" />
      </Row>
    )
  }
  if (!profile) {
    return <ErrorPage statusCode={404} withDarkMode={false} />
  }

  return (
    <FollowContext.Provider value={{ followStatus, setFollowStatus }}>
      {isPendingUpgrade && isCurrentUser && <PendingUpgradeBanner />}
      {["user", "admin"].includes(role) && isCurrentUser ? (
        <>
          <Banner>
            {" "}
            {t("content.viewingProfile")}
            <br />
            {isProfilePublic
              ? t("content.publicProfile")
              : t("content.privateProfile")}
          </Banner>
        </>
      ) : null}
      <Container>
        <ProfileHeader
          profileId={profileprops.id}
          isUser={isCurrentUser}
          profile={profile}
        />

        {isCurrentUser && !user.emailVerified ? (
          <Row>
            <Col>
              <VerifyAccountSection className="mb-4" user={user} />
            </Col>
          </Row>
        ) : null}

        <Row>{isOrg ? <OrgContactInfo profile={profile} /> : <></>}</Row>

        <Row>
          <Col className={`mb-4 mb-md-0`}>
            <ProfileAboutSection isOrg={isOrg} profile={profile} />
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
              {...testimony} // return from the usePublishedTestimonyListing hook, includes full testimony object
              totalTestimonies={totalUserPubTestimony} // total number of testimonies published by user
              onProfilePage={true}
              className="mb-4"
              isOrg={isOrg}
            />
          </Col>
        </Row>
      </Container>
    </FollowContext.Provider>
  )
}
