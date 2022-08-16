import { profile } from "console"
import { User } from "firebase/auth"
import { userInfo } from "os"
import Image from "react-bootstrap/Image"
import { useAuth } from "../auth"
import { useSendEmailVerification } from "../auth/hooks"
import { Alert, Button, Col, Container, Row, Spinner } from "../bootstrap"
import { LoadingButton } from "../buttons"
import { Profile, usePublicProfile, usePublishedTestimonyListing } from "../db"
import { External, Internal } from "../links"
import { TitledSectionCard } from "../shared"
import ViewTestimony from "../UserTestimonies/ViewTestimony"
import {
  Header,
  ProfileDisplayName,
  UserIcon,
  VerifiedBadge
} from "./StyledEditOrgCompnents"

export function OrgPage({ id }: { id: string }) {
  const { user } = useAuth()

  console.log("From user: ", user)

  console.log("from public profile result: ", usePublicProfile(id).result)

  const { result: profile, loading } = usePublicProfile(id)

  const isUser = user?.uid === id

  const displayName = profile?.displayName
  const isOrganization = profile?.organization

  const testimony = usePublishedTestimonyListing({uid:id})



  return (
    <>
      {loading ? (
        <Row>
          <Spinner animation="border" className="mx-auto" />
        </Row>
      ) : (
        <>
          {isUser && (
            <Container
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
            </Container>
          )}
          <Container>
            <ProfileHeader
              displayName={displayName}
              isUser={isUser}
              isOrganization={isOrganization as boolean}
              profileImage={profile?.profileImage}
            />

            {isUser && !user.emailVerified ? (
              <VerifyAccountSection user={user} />
            ) : null}

            <Row className={`mb-5`}>
              <Col>
                <ProfileAboutSection profile={profile} />
              </Col>
            </Row>

            <Row>
              <Col xs={12}>
                <ViewTestimony {...testimony} />
              </Col>
            </Row>
          </Container>
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
          <Image alt="twitter" src="twitter.svg" />
        </External>
      )}
    </Col>
    <Col>
      {linkedIn && (
        <External plain href={`https://www.linkedin.com/in/${linkedIn}`}>
          <Image alt="linkedIn" src="linkedin.svg" />
        </External>
      )}
    </Col>
  </Row>
)

export const ProfileHeader = ({
  displayName,
  isUser,
  isOrganization,
  profileImage
}: {
  displayName?: string
  isUser: boolean
  isOrganization: boolean
  profileImage?: string
}) => {
  const [firstName, lastName] = displayName
    ? displayName.split(" ")
    : ["user", "user"]

  return (
    <Header className={`d-flex`}>
      <Col xs={"auto"} className={"col-auto"}>
        <UserIcon className={`col d-none d-sm-flex`} src={profileImage} />
      </Col>
      {displayName ? (
        <Col xs={"auto"} className={"col-auto"}>
          <ProfileDisplayName className={``}>
            <div className={`firstName text-capitalize`}>{firstName}</div>
            <div className={`lastName text-capitalize`}>{lastName}</div>
          </ProfileDisplayName>

          {isOrganization && (
            <VerifiedBadge>
              <div className={"verifiedText"}>verified organization</div>
            </VerifiedBadge>
          )}
        </Col>
      ) : (
        <ProfileDisplayName className={``}>
          <div className={`firstName text-capitalize`}>Anonymous</div>
          <div className={`lastName text-capitalize`}>User</div>
        </ProfileDisplayName>
      )}
      {isUser && <EditProfileButton />}
    </Header>
  )
}

const EditProfileButton = () => {
  return (
    <Col className={`d-flex justify-content-end`}>
      <Internal href="/editprofile">
        <Button className={`btn btn-lg`}>Edit&nbsp;Profile</Button>
      </Internal>
    </Col>
  )
}

export const VerifyAccountSection = ({ user }: { user: User }) => {
  const sendEmailVerification = useSendEmailVerification()

  return (
    <TitledSectionCard title={"Verify Your Account"}>
      <div className="px-5 pt-2 pb-4">
        <p>
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
            variant="light"
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
