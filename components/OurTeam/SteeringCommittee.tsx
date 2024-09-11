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
            <Divider />
            <MemberItem
              name="John Griffin"
              descr="John Griffin is the Managing Partner for Strategy at Partners in Democracy. John spent a decade working in Massachusetts policy and politics, including as Massachusetts Policy Director at Democrats for Education Reform. He has experience advising nonprofits, campaigns, and civil society organizations on achieving their policy goals."
            />
            <Divider />
            <MemberItem
              name="Elaine Almquist"
              descr="Elaine F. Almquist is the founder and principal of Almquist & Associates, where she advises candidates and organizations on how to build political power, win office, and nurture long-term movements. Elaine has spent twenty years on the ground in campaigns and organizations, and serves on the advisory board of Rank The Vote."
            />
          </SectionContainer>
        </Col>
      </Row>
      <Row>
        <Col className="my-3">
          <SectionContainer>
            <SectionTitle className="p-2">
              User Experience, Design & Engineering Leads
            </SectionTitle>
            <MemberItem
              name="James Vasquez"
              descr="James Vasquez is a User Experience Product Designer who has been in the digital product industry for 9 years (professionally, and volunteering for projects). He currently works at CVS Health, mentors UX students at Designlab, and is a Board Member of UXPA Boston. "
            />
            <Divider />
            <MemberItem
              name="Matt King"
              descr="Matt King is a Full-Stack Software Engineer. He received a Bachelor's Degree in Computer Science and Cognitive Psychology from Northeastern University."
            />
            <Divider />
            <MemberItem
              name="Merritt Baggett"
              descr="Merritt Baggett is a freelance React Front-End Web Developer. He received a Bachelor's Degree in Psychology from Virginia Tech."
            />
            <Divider />
            <MemberItem
              name="Kimin Kim"
              descr="Kimin Kim is a Lead Front-end Developer at the Data Lab for Tech Impact with a Bachelor's Degree of Computer Science from Northeastern University. His hobbies are playing volleyball/badminton, eating good food, and learning new skills."
            />
            <Divider />
            <MemberItem
              name="Minqi Chai"
              descr="Minqi Chai is a social scientist and user experience researcher, advocating for human-centered approaches in digital transformation. She received her PhD in Political Science and Government from Cornell University."
              />
            
          </SectionContainer>
        </Col>
      </Row>
    </Container>
  )
}
