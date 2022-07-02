import Image from "react-bootstrap/Image"
import { Button, Col, Container, Nav, Row } from "../bootstrap"
import { Profile, useProfile } from "../db"
import { External, Internal, Wrap } from "../links"
import { TitledSectionCard } from "../shared"
import ViewTestimony from "../UserTestimonies/ViewTestimony"
import styles from "./Profile.module.css"
import { ProfileLegislators } from "./ProfileLegislators"
import styled from "styled-components"

export function ProfilePage() {
  const { profile } = useProfile()

  const displayName = profile?.displayName

  return (
    <Container fluid>
      <ProfileHeader displayName={displayName} />
      <Row>
        <Col xs={12} lg={8}>
          <ProfileAboutSection profile={profile} />
        </Col>
        <Col xs={12} lg={4}>
          <ProfileLegislators
            rep={profile?.representative}
            senator={profile?.senator}
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

export const ProfileAboutSection = ({ profile }: { profile?: Profile }) => {
  const { twitter, linkedIn }: { twitter?: string; linkedIn?: string } =
    profile?.social ?? {}

  return (
    <TitledSectionCard
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
  className: props.className
}))`
  margin: 0;
  font-family: Nunito;
  font-weight: 500;
  letter-spacing: -0.63px;
  text-align: justify;
  color: #000;

  .firstName {
    font-size: 24px;
  }

  .lastName {
    font-size: 44px;
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
        {displayName && (
          <ProfileDisplayName className={``}>
            <div className={`firstName`}>{firstName}</div>
            <div className={`lastName`}>{lastName}</div>
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
