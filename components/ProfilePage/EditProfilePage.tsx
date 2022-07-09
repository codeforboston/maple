import {
  ChangeEvent,
  FormEvent,
  SetStateAction,
  useEffect,
  useState
} from "react"
import styled from "styled-components"
import { useAuth } from "../auth"
import {
  Col,
  Container,
  Form,
  Nav,
  Row,
  Spinner,
  Tab,
  Tabs
} from "../bootstrap"
import { Profile, ProfileHook, useProfile } from "../db"
import { AboutMeEditForm } from "./AboutMeEditForm"
import TabContainer from "react-bootstrap/TabContainer"
import { TabContent, TabPane } from "react-bootstrap"
import ViewTestimony from "../UserTestimonies/ViewTestimony"

export function EditProfile() {
  const { user } = useAuth()
  const uid = user?.uid
  const result = useProfile()

  return result?.profile ? (
    <EditProfileForm profile={result.profile} actions={result} />
  ) : (
    <Row>
      <Spinner animation="border" className="mx-auto" />
    </Row>
  )
}

const StyledTabNav = styled(Nav).attrs(props => ({
  className: props.className
}))`
  text-align: center;
  margin: 0 1rem;
  font-family: Nunito;
  font-size: 1.25rem;
  color: var(--bs-dark);


  .nav-item {
    background-color: white;
    width: 13rem;
    overflow: visible;
    height: 2.25em;
    margin-left: 1rem;
    z-index: 1;
  }

  .nav-item:first-child {
    margin-left: 0;
  }

  .nav-item .active {
    background-color: white;
    height: 5rem;
  }
`

const StyledTabContent = styled(TabContent)`
  margin-top: -0.5rem;
  z-index: -1;
`

const Header = styled.div`
  font-size: 3.75rem;
  font-family: Nunito;
  font-weight: 500;
`
export function EditProfileForm({
  profile,
  actions
}: {
  profile: Profile
  actions: ProfileHook
}) {
  const [key, setKey] = useState("AboutYou")

  return (
    <Container>
      <Header>Edit Profile</Header>
      <TabContainer activeKey={key} onSelect={(k: any) => setKey(k)}>
        <StyledTabNav>
          <Nav.Item>
            <Nav.Link eventKey="AboutYou">About You</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="Testimonies">Testimonies</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="Following">Following</Nav.Link>
          </Nav.Item>
        </StyledTabNav>
        <StyledTabContent>
          <TabPane title="About You" eventKey="AboutYou">
            <AboutMeEditForm {...{ profile, actions }} />
          </TabPane>
          <TabPane title="Testimonies" eventKey="Testimonies">
            <ViewTestimony />
          </TabPane>
          <TabPane title="Following" eventKey="Following">
            <ViewTestimony />
          </TabPane>
        </StyledTabContent>
      </TabContainer>
    </Container>
  )
}

export const getValue = (e: ChangeEvent | FormEvent) => {
  return (e.target as HTMLInputElement).value
}

export const UploadProfileImage = () => {
  return (
    <Form.Group as={Col}>
      <Form.Label>Chose your profile image</Form.Label>
      <Form.Control
        type="file"
        accept="image/png, image/jpg"
        placeholder="Choose your profile image"
      ></Form.Control>
    </Form.Group>
  )
}
