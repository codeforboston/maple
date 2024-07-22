import { Container, Card, Row, Col } from "../bootstrap"
import RoleOfTestimonyCard from "./RoleOfTestimony/RoleOfTestimonyCard"
import BasicsOfTestimonyCard from "./BasicsOfTestimony/BasicsOfTestimonyCard"
import { TestimonyCardList } from "./TestimonyCardComponents"
import styled from "styled-components"
import {
  WritingContent,
  OralContent,
  WriteOrCallContent
} from "components/CommunicatingWithLegislators/CommunicatingWithLegislatorsContent"

const StyledContainer = styled(Container)`
  p {
    letter-spacing: -0.625px;
  }
`

const StyledCardBody = styled(Card.Body)`
  letter-spacing: -0.625px;
  line-height: 2.05rem;
`

const BasicsContent = [
  {
    title: "Anyone can submit testimony to the MA legislature",
    paragraph:
      "Legislators tend to value testimony most when it comes from their own constituents. Testimony from MA residents is typically directed to both the committee that is substantively responsible for the bill as well as the legislators (House member and Senator) representing your district.",
    src: "who.svg",
    alt: "Who"
  },
  {
    title:
      "Your testimony will be most impactful when it feels distinctive and relevant",
    paragraph:
      "Be sure to write your own text and explain why you are interested in an issue.",
    src: "what.svg",
    alt: "What"
  },
  {
    title:
      "Committees generally accept testimony up until the hearing date designated for a bill",
    paragraph:
      " You can use the bill pages on this website to identify relevant committee dates. Although some committees will accept testimony after this date, for the greatest impact you should submit your testimony before the hearing.",
    src: "when.svg",
    alt: "When"
  },
  {
    title:
      "Testimony is generally accepted by committees of the legislature by sending an email to their Chairs",
    paragraph:
      "This website, MAPLE, will help you to do this by making it easy to find a bill you want to testify in and then generate an email, which you fully control, which you can then send to the relevant personnel.",
    src: "where.svg",
    alt: "Where"
  },
  {
    title:
      "The key role of testimony is to let your legislators know how you feel about an issue",
    paragraph:
      "If you don't share your perspective, it will not be taken into account when policymakers make decisions about the laws that govern all our lives.",
    src: "why.svg",
    alt: "why"
  }
]

const RoleContent = [
  {
    title: "Your voice is instrumental to the legislative process",
    paragraph:
      "It could guide the agenda of the legislature, what topics and bills they consider, and how they decide to act and vote on each bill. ",
    src: "speaker-with-thumbs.svg",
  },
  {
    title: "Your voice give them insight",
    paragraph:
      "It can inform legislators of the benefits or negative consequences of proposed policies.",
    src: "speaker-with-leg.svg",
  },
  {
    title: "You can give suggestions",
    paragraph:
      "You can also recommend specific changes or improvements to legislation, whether you generally support or oppose the bill.",
    src: "speaker-with-pen.svg",
  }
]

const WriteContent = [
  {
    title: "Be Timely",
    paragraphs: [
      `Written testimony should be targeted towards specific bills being considered by the legislature. All Committees should formally accept testimony on each bill in the time between the start of the legislative session and the public hearing of that bill.`,
      `Some committees will continue accepting testimony after the hearing date, but it may not have the same impact on their deliberations.`
    ],
    src: "leg-with-clock.svg",
    alt: ""
  },
  {
    title: "Be Original",
    paragraphs: [
      `Legislators receive a lot of form letters and repeated sentiments from organized groups of constituents. These communications are important and their volume can be meaningful to legislators. But, almost always, an individual and personalized letter will have a greater impact.`
    ],
    src: "leg-with-lightbulb.svg",
    alt: ""
  },
  {
    title: "Be Informative",
    paragraphs: [
      `Whether you are a longtime advocate or a first time testifier, whether you have a doctoral degree in the subject or lived experience regarding a policy, and no matter your age, race, creed, or background, your testimony is important. Explain why you are concerned about an issue and why you think one policy choice would be better than another. For example, your being a parent gives you special insight into education policy, your living in a community affected by pollution gives you special insight into environmental policy, etc.`
    ],
    src: "writing.svg",
    alt: ""
  },
  {
    title: "Be Direct",
    paragraphs: [
      `State whether you support or oppose a bill. Be clear and specific about the policies you want to see. You don't have to know specific legal precedents or legislative language; just explain what you would like to happen and why.`
    ],
    src: "opinions.svg",
    alt: ""
  },
  {
    title: "Be Respectful",
    paragraphs: [
      `No matter how strongly and sincerely held your position is, there may be people of good intent who feel oppositely and expect and deserve to have their opinions considered by their legislators also. Respectful testimony will carry more weight with legislators, especially those who you may need to persuade to your side of an issue.`
    ],
    src: "respect-with-blob.svg",
    alt: ""
  }
]

const Basics = () => {
  return (
    <Container fluid="md" className="mt-3">
      <h1 className="fw-bold tracking-tighter lh-base">
        To Write Effective Testimony
      </h1>
      <p className="fs-4 tracking-tight lh-base">
        All laws passed by state legislatures should consider feedback from
        residents and community stakeholders. In Massachusetts, one way to have
        your voice heard is by submitting written testimony regarding specific
        bills. <br /> <br /> This website, the MAPLE platform, can help you
        submit your written testimony to the MA Legislature. However, please
        note that this is not an official government website and is not the only
        way to submit your testimony. Here are the essential things to know
        before submitting testimony:
      </p>
      {BasicsContent.map((value, index) => (
        <BasicsOfTestimonyCard
          title={value.title}
          index={index}
          key={value.title}
          alt={value.alt}
          paragraph={value.paragraph}
          src={`/${value.src}`}
        />
      ))}
    </Container>
  )
}

const Role = () => {
  return (
    <Container fluid="md" className="mt-3">
      <h1 className="fw-bold tracking-tighter lh-base">
        The Role of Testimony
      </h1>
      <p className="fs-4 tracking-tight lh-base">
        By speaking up, you can make the laws of Massachusetts work better for
        all of us! <br /> <br /> Everyone is able to convey their opinions to
        the legislature, but the process to submit testimony can be confusing
        and intimidating. We hope that this website, the MAPLE platform, will
        make that process easier, more straightforward, and more accessible to
        all stakeholders.
      </p>
      {RoleContent.map((value, index) => (
        <RoleOfTestimonyCard
          title={value.title}
          index={index}
          key={value.title}
          alt={value.alt}
          paragraph={value.paragraph}
          src={`/${value.src}`}
        />
      ))}
    </Container>
  )
}

const Write = () => {
  return (
    <Container fluid="md" className="mt-3">
      <h1 className="fw-bold tracking-tighter lh-base">
        Writing Effective Testimony
      </h1>
      <p className="fs-4 tracking-tight lh-base">
        The basics of writing effective testimony are to clearly outline what
        bill you are testifying about, whether you support or oppose it, why you
        are concerned about the issue, what policy you would like to see
        enacted, and what legislative district you live in. Here are some tips
        you can use to make sure the testimony you submit is as impactful as
        possible:
      </p>
      <TestimonyCardList contents={WriteContent} shouldAlternateImages={true} />
    </Container>
  )
}

const CommunicatingWithLegislators = () => {
  const CommWithLegCard = ({
    title,
    children
  }: {
    title: string
    children: JSX.Element
  }): JSX.Element => {
    return (
      <Card className={"my-5 mx-2 rounded-3 bg-white pb-4 pb-lg-5"}>
        <Card.Title as="h2" className={"mx-auto mt-4 fs-1"}>
          {title}
        </Card.Title>
        <StyledCardBody className="px-sm-4 mx-sm-4 p-lg-0 m-lg-0 fs-4">
          {children}
        </StyledCardBody>
      </Card>
    )
  }

  return (
    <StyledContainer>
      <Row className={"mb-5"}>
        <Col fluid="m" lg={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
          <h1 className={"fw-bold text-center display-4 mt-5 mx-n4"}>
            Communicating with Legislators
          </h1>
          <p className={"ms-1 fs-4"}>
            There are multiple ways to share your perspective and knowledge with
            your legislators.
          </p>

          <CommWithLegCard title="Testify in writing">
            <WritingContent />
          </CommWithLegCard>

          <CommWithLegCard title="Testify orally">
            <OralContent />
          </CommWithLegCard>

          <CommWithLegCard title="Write or call them">
            <WriteOrCallContent />
          </CommWithLegCard>
        </Col>
      </Row>
    </StyledContainer>
  )
}

export { Basics, Role, Write, CommunicatingWithLegislators }
