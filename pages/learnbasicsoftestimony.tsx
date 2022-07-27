import { Container } from "../components/bootstrap"
import { createPage } from "../components/page"
import BasicsOfTestimonyCard from "../components/BasicsOfTestimony/BasicsOfTestimonyCard"
import styles from "../components/BasicsOfTestimony/BasicsOfTestimonyCard.module.css"

const content = [
  {
    title: "Anyone can submit testimony to the MA legislature",
    paragraph:
      "Legislators tend to value testimony most when it comes from their own constituents. Testimony from MA residents is typically directed to both the committee that is substantively responsible for the bill as well as the legislators (House member and Senator) representing your district.",
    src: "WHO.png",
    alt: "Who"
  },
  {
    title:
      "Your testimony will be most impactful when it feels distinctive and relevant",
    paragraph:
      "Be sure to write your own text and explain why you are interested in an issue.",
    src: "WHAT.png",
    alt: "What"
  },
  {
    title:
      "Committees generally accept testimony up until the hearing date designated for a bill",
    paragraph:
      " You can use the bill pages on this website to identify relevant committee dates. Although some committees will accept testimony after this date, for the greatest impact you should submit your testimony before the hearing.",
    src: "WHEN.png",
    alt: "When"
  },
  {
    title:
      "Testimony is generally accepted by committees of the legislature by sending an email to their Chairs",
    paragraph:
      "This website, MAPLE, will help you to do this by making it easy to find a bill you want to testify in and then generate an email, which you fully control, which you can then send to the relevant personnel.",
    src: "WHERE.png",
    alt: "Where"
  },
  {
    title:
      "The key role of testimony is to let your legislators know how you feel about an issue",
    paragraph:
      "If you don't share your perspective, it may not be taken into account when policymakers make decisions about the laws that govern all our lives.",
    src: "WHY.png",
    alt: "why"
  }
]

export default createPage({
  title: "The Role of Testimony",
  Page: () => {
    return (
      <Container fluid="md" className="mt-3">
        <h1 className={styles.title}>The Basics of Testimony</h1>
        <p className={styles.subheader}>
          All laws passed by state legislatures should consider feedback from
          residents and community stakeholders. In Massachusetts, one way to
          have your voice heard is by submitting written testimony regarding
          specific bills. <br /> <br /> This website, the MAPLE platform, can
          help you submit your written testimony to the MA Legislature. However,
          please note that this is not an official government website and is not
          the only way to submit your testimony. Here are the essential things
          to know before submitting testimony:
        </p>
        {content.map((value, index) => (
          <BasicsOfTestimonyCard
            title={value.title}
            index={index}
            key={value.title}
            alt={value.alt}
            paragraph={value.paragraph}
            src={value.src}
          />
        ))}
      </Container>
    )
  }
})
