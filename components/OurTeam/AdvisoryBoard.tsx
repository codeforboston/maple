import { Col, Row, Container } from "../bootstrap"
import {
  MemberItem,
  PageTitle,
  PageDescr,
  SectionContainer,
  Divider
} from "./CommonComponents"

export const AdvisoryBoard = () => {
  return (
    <Container>
      <Row>
        <Col>
          <PageTitle>Advisory Board</PageTitle>
        </Col>
      </Row>
      <Row>
        <Col className="py-3">
          <PageDescr>
            The Advisory Board provides strategic advice and domain expertise to
            the MAPLE project. We are grateful to have the support of:
          </PageDescr>
        </Col>
      </Row>
      <Row>
        <Col className="my-3">
          <SectionContainer className="py-1">
            <MemberItem
              name="John Griffin"
              descr="John Griffin is the Managing Partner for Strategy at Partners in Democracy. He has spent a decade working in Massachusetts policy and politics, including as Massachusetts Policy Director at Democrats for Education Reform. John holds a Master in Public Policy degree from the Harvard Kennedy School."
            />
            <Divider />
            <MemberItem
              name="Marci Harris"
              descr="As founder and CEO of POPVOX.com and the Executive Director of the nonprofit POPVOX Foundation, Marci is passionate about the responsible use of technology to improve government and benefit humanity. She is a lawyer and former congressional staffer, who worked on the House Ways and Means committee's Affordable Care Act team. She has held fellowships with Harvard Kennedy School's Ash Center for Democracy and the New America Foundation, and is currently an adjunct professor at the University of San Francisco and a political science lecturer at San Jose State University."
            />
            <Divider />
            <MemberItem
              name="David Fields"
              descr="David Fields, Ph.D., is Professor of the Practice within the Graduate School of Education at Northeastern University and Senior Fellow with The Burnes Center for Social Change. He brings over 20 years of higher education experience building, launching, and scaling industry aligned programs. At the Burnes Center, his work includes supporting AI for Impact, and its InnovateMA co-op program in partnership with the Commonwealth of Massachusetts."
            />
            <Divider />
            <MemberItem
              name="Matt Prewitt"
              descr="Matt Prewitt is President of RadicalxChange Foundation, a nonprofit dedicated to improving the basic institutions of democracy and markets. He is also a former federal law clerk and antitrust litigator, and a writer and advisor on emerging technologies."
            />
            <Divider />
            <MemberItem
              name="James Turk"
              descr="James has spent his career working in Civic Tech. While at the Sunlight Foundation, he launched the Open States project, which curates a freely available repository of state legislative information across all 50 states, the District of Columbia, and Puerto Rico. James served as the lead of the Open States project for 13 years. James has also worked at PBS as a Director of Technology, as Principal Engineer of the Princeton Gerrymandering Project, and as Director of Public Data at Civic Eagle. James is currently an Assistant Clinical Professor at the University of Chicago, teaching in the Computational Analysis & Public Policy Program."
            />
            <Divider />
            <MemberItem
              name="Harlan Weber"
              descr="Harlan is the founder of Code for Boston, a civic technology volunteer group and the incubator of MAPLE. He is an experienced UX design leader, having spent 10 years in the government technology space. Harlan is currently a Principal Designer at Nava Public Benefit Corporation where he focuses on leading projects for Federal government clients. He has also served the Commonwealth of Massachusetts as an Innovation Fellow, as a founding member and design director of the Massachusetts Digital Service, and as the director of design for the Customer Technology Department at the MBTA."
            />
          </SectionContainer>
        </Col>
      </Row>
    </Container>
  )
}
