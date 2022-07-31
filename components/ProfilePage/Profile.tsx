import Image from "react-bootstrap/Image"
import { useAuth } from "../auth"
import { Button, Col, Container, Row, Spinner } from "../bootstrap"
import { Profile, usePublicProfile } from "../db"
import { External, Internal } from "../links"
import { TitledSectionCard } from "../shared"
import ViewTestimony from "../UserTestimonies/ViewTestimony"
import { ProfileLegislators } from "./ProfileLegislators"

import {
  Header,
  ProfileDisplayName,
  UserIcon
} from "./StyledEditProfileCompnents"
export function ProfilePage({ id }: { id: string }) {
  const { user } = useAuth()
  const { result: profile, loading } = usePublicProfile(id)

  const isUser = user?.uid === id

  const displayName = profile?.displayName

  return (
    <>
      {
      loading ? (
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
            <ProfileHeader displayName={displayName} isUser={isUser} />
            <Row className={`mb-5`}>
              <Col>
                <ProfileAboutSection profile={profile} />
              </Col>
              {isUser && (
                <Col xs={12} md={4}>
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
                <ViewTestimony uid={id} />
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
  isUser
}: {
  displayName?: string
  isUser: boolean
}) => {
  const [firstName, lastName] = displayName
    ? displayName.split(" ")
    : ["user", "user"]

  return (
    <Header className={`d-flex`}>
      <Col xs={"auto"} className={"col-auto"}>
        <UserIcon className={`col d-none d-sm-flex`} />
      </Col>
      {displayName ? (
        <ProfileDisplayName className={``}>
          <div className={`firstName text-capitalize`}>{firstName}</div>
          <div className={`lastName text-capitalize`}>{lastName}</div>
        </ProfileDisplayName>
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
      {/* <div
        className={`d-flex justify-content-center justify-content-md-end align-items-center align-items-md-end`}
      > */}
      <Internal href="/editprofile">
        <Button className={`btn btn-lg`}>Edit&nbsp;Profile</Button>
      </Internal>
      {/* </div> */}
    </Col>
  )
}
