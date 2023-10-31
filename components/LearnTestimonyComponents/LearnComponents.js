import { Container, Row, Col } from "../bootstrap"
import RoleOfTestimonyCard from "./RoleOfTestimony/RoleOfTestimonyCard"
import styles from "./LearnTestimonies/LearnTestimoniesCard.module.css"
import LearnTestimoniesCard from "./LearnTestimonies/LearnTestimoniesCard"
import LearnTestimoniesCardContent from "./LearnTestimonies/LearnTestimoniesCardContent"
import BasicsOfTestimonyCard from "./BasicsOfTestimony/BasicsOfTestimonyCard"
import LegislativeCard from "./LegislativeProcess/LegislativeCard"
import LegislativeCardContent from "./LegislativeProcess/LegislativeCardContent"

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
    alt: "Speaker with thumbs"
  },
  {
    title: "Your voice give them insight",
    paragraph:
      "It can inform legislators of the benefits or negative consequences of proposed policies.",
    src: "speaker-with-leg.svg",
    alt: "Speaker with documents"
  },
  {
    title: "You can give suggestions",
    paragraph:
      "You can also recommend specific changes or improvements to legislation, whether you generally support or oppose the bill.",
    src: "speaker-with-pen.svg",
    alt: "Speaker with pen"
  }
]

const WriteContent = [
  {
    title: "Be Timely",
    paragraph: {
      P1: `Written testimony should be targeted towards specific bills being considered by the legislature. All Committees should formally accept testimony on each bill in the time between the start of the legislative session and the public hearing of that bill.`,
      P2: `
            Some committees will continue accepting testimony after the hearing date, but it may not have the same impact on their deliberations.`
    },
    src: "leg-with-clock.svg",
    alt: "Document with clock"
  },
  {
    title: "Be Original",
    paragraph: {
      P1: `Legislators receive a lot of form letters and repeated sentiments from organized groups of constituents. These communications are important and their volume can be meaningful to legislators. But, almost always, an individual and personalized letter will have a greater impact.`
    },
    src: "leg-with-lightbulb.svg",
    alt: "Document with clock"
  },
  {
    title: "Be Informative",
    paragraph: {
      P1: `Whether you are a longtime advocate or a first time testifier, whether you have a doctoral degree in the subject or lived experience regarding a policy, and no matter your age, race, creed, or background, your testimony is important. Explain why you are concerned about an issue and why you think one policy choice would be better than another. For example, your being a parent gives you special insight into education policy, your living in a community affected by pollution gives you special insight into environmental policy, etc.`
    },
    src: "writing.svg",
    alt: "Document with clock",
    imgFlag: 1
  },
  {
    title: "Be Direct",
    paragraph: {
      P1: `State whether you support or oppose a bill. Be clear and specific about the policies you want to see. You don't have to know specific legal precedents or legislative language; just explain what you would like to happen and why.`
    },
    src: "opinions.svg",
    alt: "Document with clock"
  },
  {
    title: "Be Respectful",
    paragraph: {
      P1: `No matter how strongly and sincerely held your position is, there may be people of good intent who feel oppositely and expect and deserve to have their opinions considered by their legislators also. Respectful testimony will carry more weight with legislators, especially those who you may need to persuade to your side of an issue.`
    },
    src: "respect-with-blob.svg",
    alt: "Document with clock"
  }
]

const LegislativeContent = [
  {
    title: "Filing",
    paragraph: {
      P1: `A Representative, Senator, or the Governor must file a bill. Constituents can write to their legislators (typically their own  district's House or Senate member) to propose a bill to be filed. This can be done at any time, but is typically done before the start of the legislative session (i.e. before the third Friday in January of odd-numbered years). Bills filed later, during the legislative session, require special approval.`
    },
    src: "speaker-podium.svg",
    alt: "Document with clock"
  },
  {
    title: "Testimony",
    paragraph: {
      P1: `All stakeholders have the chance to share their thoughts with the legislature by submitting written testimony. Typically, testimony is submitted to the legislative Committee responsible for the bill in advance of their public hearing. You can also deliver oral testimony by attending a hearing or you can reach out to your legislators and speak to them directly.`
    },
    src: "mic-with-testify.svg",
    alt: "Document with clock"
  },
  {
    title: "Public hearing",
    paragraph: {
      P1: `All bills are formally heard by committees during public hearings which are open to the public and recorded and posted as videos on the legislature's website. While the amount of time available to speak during a public hearing is limited, more detailed comments can be submitted to the committee in written testimony.`
    },
    src: "doc-with-arrows-to-people.svg",
    alt: "Document with clock",
    imgFlag: 1
  },
  {
    title: "Committee reports",
    paragraph: {
      P1: `Committee reports. Committees must file reports on each bill under their consideration after discussing them in Executive Session following the public hearing. This typically occurs before February of the second year of the legislative session (even-numbered years). The goal for proponents of a bill is that the Committee will recommend they "ought to pass" and thereby promote them out of the Committee. Most bills, however are "sent to study," meaning that they will not be passed out of committee in that session. A successful bill may be redrafted or amended by the committee based on testimony received and other deliberations. Many of those bills will be refiled in the next session and can be considered again.`
    },
    src: "leg-with-lightbulb.svg",
    alt: "Document with clock"
  },
  {
    title: "Three readings",
    paragraph: {
      P1: `Each bill passed out of Committee will be "read" three times by each branch, the House and Senate. This typically entails floor debate of the full chamber and a vote of the Committee on Ways and Means or Steering and Policy.`
    },
    src: "speaker-with-leg.svg",
    alt: "Document with clock"
  },
  {
    title: "Engrossment and Enactment",
    paragraph: {
      P1: `After the three readings, the bill will be voted on by each of the full chambers (House and Senate), resulting in (if successful) "engrossment" and then "enactment.`
    },
    src: "opinions.svg",
    alt: "Document with clock"
  },
  {
    title: "Conference Committee",
    paragraph: {
      P1: `If necessary, differences between the House and Senate versions of a bill will be reconciled by a temporary Conference Committee appointed by the House Speaker and Senate President.`
    },
    src: "respect-with-blob.svg",
    alt: "Document with clock"
  },
  {
    title: "Executive branch",
    paragraph: {
      P1: `Lastly, the Governor is responsible for signing the enacted and reconciled bill into law. The governor can also veto the bill, return it to the Legislature for changes, or take a number of other less-common actions.`
    },
    src: "speaker-with-pen.svg",
    alt: "Document with clock"
  }
]

const Basics = () => {
  return (
    <Container fluid="md" className="mt-3">
      <h1 className={styles.title}>The Basics of Testimony</h1>
      <p className={styles.subheader}>
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
      <h1 className={styles.title}>The Role of Testimony</h1>
      <p className={styles.subheader}>
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
      <h1 className={styles.title}>Writing Effective Testimony</h1>
      <p className={styles.subheader}>
        The basics of writing effective testimony are to clearly outline what
        bill you are testifying about, whether you support or oppose it, why you
        are concerned about the issue, what policy you would like to see
        enacted, and what legislative district you live in. Here are some tips
        you can use to make sure the testimony you submit is as impactful as
        possible:
      </p>
      {WriteContent.map((value, index) => (
        <LearnTestimoniesCard title={value.title} key={value.title}>
          <LearnTestimoniesCardContent
            src={`/${value.src}`}
            alt={value.alt}
            index={index}
          >
            {value.paragraph}
          </LearnTestimoniesCardContent>
        </LearnTestimoniesCard>
      ))}
    </Container>
  )
}

const Legislative = () => {
  return (
    <Container>
      <Row className={styles.container}>
        <Col>
          <h1 className={styles.pageHeading}>
            Understanding the Massachusetts Legislative Process
          </h1>
          <p className={styles.subHeading}>
            Some of the key steps in the legislative process for how most bills
            become laws in MA.
          </p>

          {LegislativeContent.map((value, index) => (
            <LegislativeCard title={value.title} key={value.title}>
              <LegislativeCardContent
                src={`/${value.src}`}
                alt={value.alt}
                index={index}
              >
                {value.paragraph}
              </LegislativeCardContent>
            </LegislativeCard>
          ))}
        </Col>
      </Row>
    </Container>
  )
}

export { Basics, Role, Write, Legislative }
