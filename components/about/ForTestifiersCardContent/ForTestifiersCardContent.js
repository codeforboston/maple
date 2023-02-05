import { Row, Col } from "../../bootstrap"
import Image from "react-bootstrap/Image"
import styles from "./ForTestifiersCardContent.module.css"
import { SignInWithButton } from "../../auth"
import Link from "next/link"

const WhyMAPLECardContent = () => (
  <>
    <h3 className={`text-right fw-bold mt-3 ${styles.calltoaction}`}>
      MAPLE makes it easy for you to join the Commonwealth-wide conversation
      about the bills that will shape our future.
    </h3>
    <p>
      With a quick search on MAPLE, you can see what bills the state legislature
      is considering about the topics that matter to you. You can find out what
      policy changes are proposed, see what other constituents and organizations
      are saying about them, and&mdash;most important&mdash;you can submit
      written tesitmony directly to our representatives in the State House to
      make your perspective part of the conversation.
    </p>
  </>
)

const BenefitsCardContent = () => (
  <>
    <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
      Weigh in on the issues that matter to you
    </h3>
    <Row className="mb-3">
      <Col>
        <p>
          Before the Massachusetts state legislature can pass a bill, they
          convene three committees to hear public testimony on the policy
          changes that bill proposes. Don&apos;t miss out on the chance to make
          your perspective heard; submit your testimony to use your voice to
          shape public policy for our Commonwealth.
        </p>
      </Col>
    </Row>

    <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
      Hear from multiples sides and perspectives
    </h3>
    <Row className="mb-3">
      <Col>
        <p>
          As a non-partisan platform, all stakeholders can use MAPLE to share
          their perspective on issues and bills. See what others are saying to
          get more informed about the most important public policy issues of the
          day.
        </p>
      </Col>
    </Row>

    <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
      See what the organizations you trust are saying
    </h3>
    <Row className="mb-3">
      <Col>
        <p>
          Organizations use MAPLE to share their priorities and positions with
          the world. Look for testimony from the groups you belong to and trust
          on MAPLE to help you learn about the issues that matter to you.
        </p>
      </Col>
    </Row>

    <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
      Read and write testimony in any language
    </h3>
    <Row className="mb-3">
      <Col>
        <p>
          Both our website content and the testimonies we post can be
          automatically translated to any language on demand, so non-English
          speakers can write testimony in any language and legislators can click
          a button to automatically translate it to English. While machine
          translation is not perfect, it offers a big step forward in language
          accessibility for testifiers who do not have access to expert
          translation.
        </p>
      </Col>
    </Row>

    <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
      Find out what&apos;s happening on the issues you care about
    </h3>
    <Row className="mb-3">
      <Col>
        <p>
          The legislative process on any bill or policy issue can be long and
          complicated. Use MAPLE to get easy access to up-to-date,
          contextualized information on the status, debate, and next steps for
          every bill before the legislature.
        </p>
      </Col>
    </Row>
  </>
)

const ChallengeCardContent = () => (
  <>
    <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`} id="clo">
      Sign up for your account today to make your voice heard.
    </h3>
    <p>
      When you sign up for a MAPLE account, you can immediately start submitting
      your own testimony on any bill.
    </p>
    <p>
      Creating a MAPLE account is completely free and takes only a couple
      minutes.
    </p>
    <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`} id="clo">
      <div className={styles.btncontainer}>
        <SignInWithButton label="Click here to sign up for your MAPLE account" />
      </div>
    </h3>
    <h3 className={`text-right fw-bold mt-3 ${styles.calltoaction}`}>
      <a href="mailto:mapletestimony@gmail.com">
        Any questions? Reach out to mapletestimony@gmail.com
      </a>
    </h3>
  </>
)

export { WhyMAPLECardContent, BenefitsCardContent, ChallengeCardContent }
