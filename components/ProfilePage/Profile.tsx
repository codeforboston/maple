import { useSendEmailVerification } from "components/auth/hooks"
import { User } from "firebase/auth"
import { useCallback } from "react"
import Image from "react-bootstrap/Image"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"
import { useAuth } from "../auth"
import { Alert, Button, Col, Container, Row, Spinner } from "../bootstrap"
import { LoadingButton } from "../buttons"
import { Profile, usePublicProfile, usePublishedTestimonyListing } from "../db"
import { External, Internal } from "../links"
import { TitledSectionCard } from "../shared"
import ViewTestimony from "../UserTestimonies/ViewTestimony"
import { ProfileLegislators } from "./ProfileLegislators"
import {
  Header,
  ProfileDisplayName,
  UserIcon,
  VerifiedBadge
} from "./StyledEditProfileCompnents"

const StyledContainer = styled(Container)`
  .about-me-checkbox input {
    height: 25px;
    width: 25px;
    margin-top: 0;
    border-color: #12266f;
  }

  .input-social-media::placeholder {
    font-size: 12px;
  }

  .save-profile-button > button {
    width: 100%;
  }

  .edit-profile-header {
    flex-direction: column !important;
  }

  .your-legislators-width {
    width: 100%;
  }

  .view-edit-profile {
    width: 100%;
    text-decoration: none;
  }

  .view-edit-profile > button {
    width: 100%;
  }

  @media (min-width: 768px) {
    .edit-profile-header {
      flex-direction: row !important;
    }

    .your-legislators-width {
      width: 50%;
    }

    .save-profile-button {
      align-self: flex-end;
      width: auto;
    }

    .view-edit-profile {
      display: flex;
      justify-content: flex-end;
    }

    .view-edit-profile > button {
      width: auto;
    }
  }
`

export function ProfilePage({ id }: { id: string }) {
  const { user } = useAuth()
  const { result: profile, loading } = usePublicProfile(id)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const isUser = user?.uid === id

  const testimony = usePublishedTestimonyListing({
    uid: id
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
              profileImage={profileImage || "/profile-icon.svg"}
              isMobile={isMobile}
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

export const ProfileAboutSection = ({
  profile,
  className
}: {
  profile?: Profile
  className?: string
  isMobile?: boolean
}) => {
  const { twitter, linkedIn }: { twitter?: string; linkedIn?: string } =
    profile?.social ?? {}

  return (
    <TitledSectionCard
      className={`${className} h-100`}
      title={`About ${profile?.displayName?.split(" ")[0] ?? "User"}`}
      bug={<Socials twit={twitter} linkedIn={linkedIn} />}
      footer={<></>}
    >
      <div className="mx-5 my-2">{profile?.about ?? "State your purpose"}</div>
    </TitledSectionCard>
  )
}

export const Socials = ({
  twit: twitter,
  linkedIn
}: {
  twit?: string
  linkedIn?: string
}) => (
  <Row className={`d-flex`}>
    <Col className={`d-flex flex-grow-1 justify-content-between`}>
      {twitter && (
        <External plain href={`https://www.twitter.com/${twitter}`}>
          <Image alt="twitter" src="/twitter.svg" />
        </External>
      )}
    </Col>
    <Col>
      {linkedIn && (
        <External plain href={`https://www.linkedin.com/in/${linkedIn}`}>
          <Image alt="linkedIn" src="/linkedin.svg" />
        </External>
      )}
    </Col>
  </Row>
)

export const ProfileHeader = ({
  displayName,
  isUser,
  isOrganization,
  profileImage,
  isMobile
}: {
  displayName?: string
  isUser: boolean
  isOrganization: boolean
  profileImage?: string
  isMobile: boolean
}) => {
  const [firstName, lastName] = displayName
    ? displayName.split(" ")
    : ["user", "user"]

  return (
    <Header className={`d-flex edit-profile-header`}>
      {isOrganization ? (
        <Col xs={"auto"} className={"col-auto"}>
          <UserIcon className={`col d-none d-sm-flex`} src={profileImage} />
        </Col>
      ) : (
        <Col xs={"auto"} className={"col-auto"}>
          <UserIcon className={`col d-none d-md-flex`} />
        </Col>
      )}

      {displayName ? (
        <Col xs={"auto"} className={"col-auto"}>
          <ProfileDisplayName
            className={`align-items-center ${!isMobile ? "d-block" : "d-flex"}`}
          >
            <div
              className={`${!isMobile ? "firstName" : "me-2"} text-capitalize`}
            >
              {firstName}
            </div>
            <div className={`lastName text-capitalize`}>{lastName}</div>
          </ProfileDisplayName>

          {isOrganization && (
            <VerifiedBadge>
              <div className={"verifiedText"}>verified organization</div>
            </VerifiedBadge>
          )}
        </Col>
      ) : (
        <ProfileDisplayName
          className={`align-items-center ${!isMobile ? "d-block" : "d-flex"}`}
        >
          <div
            className={`${!isMobile ? "firstName" : "me-2"} text-capitalize`}
          >
            Anonymous
          </div>
          <div className={`lastName text-capitalize`}>User</div>
        </ProfileDisplayName>
      )}
      {isUser && <EditProfileButton />}
    </Header>
  )
}

const EditProfileButton = () => {
  return (
    <Col className={`d-flex justify-content-end w-100`}>
      <Internal href="/editprofile" className="view-edit-profile">
        <Button className={`btn btn-lg`}>Edit&nbsp;Profile</Button>
      </Internal>
    </Col>
  )
}

export const VerifyAccountSection = ({ user }: { user: User }) => {
  const sendEmailVerification = useSendEmailVerification()

  return (
    <TitledSectionCard title={"Verify Your Account"} className="col">
      <div className="px-5 pt-2 pb-4">
        <p className="fw-bold text-info">
          We sent a link to your email to verify your account, but you haven't
          clicked it yet. If you don't see it, be sure to check your spam
          folder.
        </p>

        {sendEmailVerification.status === "success" ? (
          <Alert variant="success">Check your email!</Alert>
        ) : null}

        {sendEmailVerification.status === "error" ? (
          <Alert variant="danger">{sendEmailVerification.error?.message}</Alert>
        ) : null}

        {sendEmailVerification.status !== "success" ? (
          <LoadingButton
            variant="info"
            className="text-white"
            loading={sendEmailVerification.loading}
            onClick={() => sendEmailVerification.execute(user)}
          >
            Send Another Link
          </LoadingButton>
        ) : null}
      </div>
    </TitledSectionCard>
  )
}
