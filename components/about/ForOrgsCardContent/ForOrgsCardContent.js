import { Row, Col } from "../../bootstrap"
import Image from "react-bootstrap/Image"
import styles from "./ForOrgsCardContent.module.css"
import { SignInWithModal } from "../../auth"
import Link from "next/link"

const WhyMAPLECardContent = () => (
  <>
    <h3 className={`text-right fw-bold mt-3 ${styles.calltoaction}`}>
      MAPLE is a powerful communication tool for organizations, offered
      completely for free.
    </h3>
    <p>
      It takes only a couple minutes to sign up for your organization&apos;s
      account on MAPLE, giving you immediate access to publish and share your
      testimony, designate your priority bills, connect with your members and
      followers, and research legislation.
    </p>
  </>
)

const BenefitsCardContent = () => (
  <>
    <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
      Help your priorities &amp; positions reach a wider audience
    </h3>
    <Row className="mb-3">
      <Col>
        <p>
          Your organization&apos;s testimony will be highlighted to MAPLE
          visitors when they look up bills, with easy tools for sharing on
          social media. Testimony published on MAPLE will be seen by
          legislators, residents, members of the media, and other stakeholders.
          The more organizations share their testimony on the platform, the more
          people will see it. You can even designate bills as your legislative
          priorities to signal your focus for each session.{" "}
        </p>
      </Col>
    </Row>

    <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
      Connect with your members, and grow your reach
    </h3>
    <Row className="mb-3">
      <Col>
        <p>
          MAPLE users can discover your profile when searching for their policy
          interests and follow your organization to get updates on your
          priorities and positions. MAPLE helps alert your constituents to the
          most important bills on issues you care about, and helps you explain
          why you support or oppose them.{" "}
        </p>
      </Col>
    </Row>

    <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
      Extend access to members who speak any language
    </h3>
    <Row className="mb-3">
      <Col>
        <p>
          MAPLE uses machine translation to make the legislative process more
          accessible to non-native English speakers. Both our website content
          and the testimonies we post can be automatically translated to any
          language on demand, meaning that non-English speakers can write
          testimony in the language in which they are most comfortable and
          legislative offices can click a button to translate it to English.
          While machine translation is not perfect, it offers a big step forward
          in language accessibility for constituents who do not have access to
          expert translation.
        </p>
      </Col>
    </Row>

    <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
      Coordinate legislative communication campaigns with ease
    </h3>
    <Row className="mb-3">
      <Col>
        <p>
          By linking to a bill page on MAPLE, your constituents can submit their
          own testimony with just a few clicks. MAPLE makes it easy for users of
          any experience level to draft, format, and submit their testimony to
          the right legislators for any bill.{" "}
        </p>
      </Col>
    </Row>

    <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
      See what everyone&apos;s saying
    </h3>
    <Row className="mb-3">
      <Col>
        <p>
          Even if you don&apos;t sign in, you can use MAPLE to browse testimony
          submitted on any bill. Get a lay of the land and track public opinion
          at a glance using our endorse / oppose ratios. Read the full testimony
          of any user to find other stakeholders you may want to connect with or
          learn from.{" "}
        </p>
      </Col>
    </Row>

    <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
      Curate your testimony history
    </h3>
    <Row className="mb-3">
      <Col>
        <p>
          When you submit your testimony through MAPLE, it automatically appears
          in an indexed &amp; organized listing on your profile page. Use your
          profile to automatically generate a record of your lobbying efforts
          for your website, for member communications, or for semi-annual
          filings. You can also publish previously submitted tesitmony on MAPLE
          at any time.{" "}
        </p>
      </Col>
    </Row>

    <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
      Speed up your legislative research
    </h3>
    <Row className="mb-3">
      <Col>
        <p>
          MAPLE is fast. (Really fast.) Try
          <Link href="/bills">
            <a>searching for a bill</a>
          </Link>{" "}
          to see just how much MAPLE can speed up your legislative research
          process; no sign in required!{" "}
        </p>
      </Col>
    </Row>

    <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
      Help change the norms in Massachusetts
    </h3>
    <Row className="mb-3">
      <Col>
        <p>
          The Commonwealth can be a leader in legislative transparency and good
          government. Help shift the norms in Massachusetts by making your
          testimony available for anyone to read.{" "}
        </p>
      </Col>
    </Row>

    <Row className="text-center">
      <Col>
        <h3 className={`fw-bold mt-3 ${styles.calltoaction}`}>
          Ready to sign up for MAPLE?
        </h3>
      </Col>
    </Row>
    <Row className="text-center mb-3">
      <Col>
        <SignInWithModal />
      </Col>
    </Row>
  </>
)

const ChallengeCardContent = () => (
  <>
    <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`} id="clo">
      Join MAPLE&apos;s Coalition to make the 193rd General Court the most
      transparent in Massachusetts history!
    </h3>
    <p>
      Organizations that join MAPLE&apos;s Coalition of Lead Organizations (CLO)
      commit to publishing all of their public testimony submitted to the 193rd
      General Court through the MAPLE platform. The 193rd General Court is the
      session that runs from January of 2023 through 2024.{" "}
    </p>
    <p>
      In addition to all the benefits outlined above, these organizations will
      have their profiles featured prominently on the MAPLE website during the
      two-year legislative session. Any organization can contact MAPLE to be
      considered for membership in the CLO. Organizations will be prioritized to
      join the CLO based on the size of the constituency they represent.
    </p>
    <p>
      Maple is a nonpartisan project and does not take political positions;
      membership in the CLO does not indicate endorsement of any political
      position by MAPLE or its parent organization, members, or collaborators.
    </p>
    <h3 className={`text-right fw-bold mt-3 ${styles.calltoaction}`}>
      <a href="mailto:mapletestimony@gmail.com">
        Join the MAPLE coalition&mdash;reach out to mapletestimony@gmail.com
      </a>
    </h3>
  </>
)

export { WhyMAPLECardContent, BenefitsCardContent, ChallengeCardContent }
