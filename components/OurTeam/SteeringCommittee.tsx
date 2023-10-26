import { Col, Row, Container } from "../bootstrap"
import {
  MemberItem,
  Divider,
  PageTitle,
  PageDescr,
  SectionContainer,
  SectionTitle
} from "./CommonComponents"

export const SteeringCommittee = () => {
  return (
    <Container>
      <Row>
        <Col>
          <PageTitle>Steering Committee</PageTitle>
        </Col>
      </Row>
      <Row>
        <Col className="py-3">
          <PageDescr>
            The Steering Committee directs the overall operations of MAPLE,
            which includes the management of volunteers, establishing project
            direction, and making decisions about development and
            communications.
          </PageDescr>
        </Col>
      </Row>
      <Row>
        <Col className="my-3">
          <SectionContainer>
            <SectionTitle className="p-2">
              Product Management & Leadership
            </SectionTitle>
            <MemberItem
              name="Matthew Victor"
              email="mvictor@mapletestimony.org"
              descr="Matthew Victor is a Boston-based lawyer, policy analyst and civic technologist. He is a former technology consultant and has worked in the life sciences, non-profit research and blockchain industries. Matthew graduated from Boston College Law School in 2022."
            />
            <Divider />
            <MemberItem
              name="Nathan Sanders"
              email="nsanders@mapletestimony.org"
              descr="Nathan Sanders is a data scientist, an organizer in science communication, and an environmental justice researcher & advocate. He has led machine learning teams in the media and biotech sectors and is an Affiliate of the Berkman-Klein Center at Harvard University."
            />
            <Divider />
            <MemberItem
              name="Anna Steele"
              descr="Anna Steele is a legal technologist and project manager who strives to make the law more accessible through the thoughtful use of technology. In her current role as the Legal Operations Manager at Howell Legal, Anna supports a team of attorneys in their mission to empower entrepreneurs."
            />
            <Divider />
            <MemberItem
              name="Dan Jackson"
              descr="Dan Jackson directs Northeastern University School of Law’s NuLawLab, where he draws on his design and law backgrounds to educate the legal inventors of the future."
            />
          </SectionContainer>
        </Col>
      </Row>
      <Row>
        <Col className="my-3">
          <SectionContainer>
            <SectionTitle className="p-2">
              User Experience Design & Engineering Leads
            </SectionTitle>
            <MemberItem
              name="Alex Ball"
              descr="Alex Ball is a full-stack software developer. He enjoys building useful user experiences, learning new technologies, and helping other developers be productive. He currently works at Cyvl.ai on geospatial applications to help governments manage their infrastructure assets."
            />
            <Divider />
            <MemberItem
              name="Sasha Goldberg"
              descr="Sasha Goldberg has volunteered with Code for Boston for over seven years and is a full stack developer. Before entering the software development profession, Sasha was a video editor and motion graphic designer."
            />
            <Divider />
            <MemberItem
              name="James Vasquez"
              descr="James Vasquez is a User Experience Product Designer who has been in the digital product industry for 9 years (professionally, and volunteering for projects). He currently works at CVS Health, mentors UX students at Designlab, and is a Board Member of UXPA Boston. "
            />
          </SectionContainer>
        </Col>
      </Row>
    </Container>
  )
}
