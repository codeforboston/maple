import Image from "react-bootstrap/Image"
import styled from "styled-components"
import { Button, Col, Container, Row } from "../bootstrap"
import { Profile, useProfile } from "../db"
import { External, Internal } from "../links"
import { TitledSectionCard } from "../shared"
import ViewTestimony from "../UserTestimonies/ViewTestimony"
import { ProfileLegislators } from "./ProfileLegislators"

export function ProfilePage() {
  const { profile } = useProfile()

  const displayName = profile?.displayName

  return (
    <Container>
      <ProfileHeader displayName={displayName} />
      <Row className={`mb-5`}>
        <Col xs={12} lg={8}>
          <ProfileAboutSection profile={profile} className={`h-100`} />
        </Col>
        <Col xs={12} lg={4}>
          <ProfileLegislators
            rep={profile?.representative}
            senator={profile?.senator}
            className={`h-100`}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <ViewTestimony />
        </Col>
      </Row>
    </Container>
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
      className={className}
      title={`About ${profile?.displayName?.split(" ")[0] ?? "User"}`}
      bug={<Socials twit={twitter} linkedIn={linkedIn} />}
      footer={<></>}
    >
      {profile?.about ?? "State your purpose"}
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

export const ProfileDisplayName = styled.div.attrs(props => ({
  className: `${props.className}`
}))`
  margin: 0;
  font-family: Nunito;
  font-weight: 500;
  letter-spacing: -0.63px;
  text-align: justify;
  color: #000;

  .firstName {
    font-size: 1.5rem;
  }

  .lastName {
    font-size: 2.75rem;
  }
`

export const UserIcon = styled(Image).attrs(props => ({
  alt: "",
  src: "profile-icon.svg",
  className: props.className
}))`
  height: 8em;
  width: 8em;
  margin: 1em;
  border-radius: 50%;
  border: 1em solid var(--bs-blue);
  background-color: var(--bs-blue);
  flex: 0;
`

export const ProfileHeader = ({ displayName }: { displayName?: string }) => {
  const [firstName, lastName] = displayName
    ? displayName.split(" ")
    : ["user", "user"]

  return (
    <Row className={`d-flex align-items-center justify-content-center`}>
      <Col
        className={`col-12 col-md-5 d-flex align-items-center justify-content-center justify-content-md-start`}
      >
        <UserIcon className={`col d-none d-sm-flex`} />
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
      </Col>
      <Col className={`col-12 col-md-5`}>
        <div
          className={`d-flex justify-content-center justify-content-md-end align-items-center align-items-md-end`}
        >
          <Internal href="/editprofile">
            <Button className={`btn btn-lg`}>Edit&nbsp;Profile</Button>
          </Internal>
        </div>
      </Col>
    </Row>
  )
}
