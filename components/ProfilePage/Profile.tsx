import Image from "react-bootstrap/Image"
import { Button, Col, Container, Nav, Row } from "../bootstrap"
import { Profile, useProfile } from "../db"
import { External } from "../links"
import TitledSectionCard from "../TitledSection/TitledSectionCard"
import ViewTestimony from "../UserTestimonies/ViewTestimony"
import styles from "./Profile.module.css"
import { ProfileLegislators } from "./ProfileLegislators"

export function ProfilePage() {
  const { profile } = useProfile()
  
  const displayName = profile?.displayName

  return (
    <Container fluid>
      <ProfileHeader displayName={displayName} />
      <Row>
        <Col xs={{ span: 12 }} md={{ span: 7, offset: 1 }}>
          <ProfileAboutSection profile={profile} />
        </Col>
        <Col xs={12} md={{ span: 3 }}>
          <ProfileLegislators
            rep={profile?.representative}
            senator={profile?.senator}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={{ span: 10, offset: 1 }}>
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
      <Row>
        <Col className={`mx-4 mb-5`}>
          <p>{profile?.about ?? "State your purpose"}</p>
        </Col>
      </Row>
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
  <Row className={`d-flex justify-content-end`}>
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

export const ProfileHeader = ({ displayName }: { displayName?: string }) => {
  return (
    <Row className="align-items-center justify-content-start py-5">
      <Col xs={1}></Col>
      <Col xs={1} className={`${styles.userIconWrap} flex-shrink-0`}>
        <div className={`${styles.userIcon}`}></div>
      </Col>
      <Col className={`flex-grow-1 mx-2`}>
        {displayName && <ProfileDisplayName displayName={displayName} />}
      </Col>
      <Col xs={1} className={`d-flex flex-grow-1 justify-content-end p-4`}>
        <Nav.Link href="/editprofile">
          <Button className={`px-5 mx-5`}>Edit Profile</Button>
        </Nav.Link>
      </Col>
      <Col xs={1}></Col>
    </Row>
  )
}

export const ProfileDisplayName = ({
  displayName
}: {
  displayName: string
}) => {
  const [firstName, lastName] = displayName.split(" ")

  return (
    <Row className="w-100">
      <Col className="">
        <div className={`${styles.displayFace2}`}>{firstName}</div>
        <div className={`${styles.displayFace1}`}>{lastName}</div>
      </Col>
    </Row>
  )
}
