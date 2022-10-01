import { Row, Col } from "../bootstrap"
import Image from "react-bootstrap/Image"
import styles from "./ForOrgsCardContent.module.css"
import { SignInWithModal } from "../auth"

const WhyMAPLECardContent = () => (
  <>
    <p>
      MAPLE is a powerful communication tool for organizations, offered
      completely for free.
    </p>
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
    <h3 className={`text-left fw-bold mb-4 ${styles.missionheader}`}>
      Help your priorities &amp; positions reach a wider audience
    </h3>
    <Row className="mb-3">
      <Col>
        <p>
          Your organization&apos;s testimony will be highlighted to MAPLE
          visitors when they look up bills, with easy tools for sharing on
          social media. Testimony published onMAPLE will be seen by legislators,
          residents, members of the media, and other stakeholders. The more
          organizations share their testimony on the platform, the more people
          will see it. You can even designate bills as your lesilative
          priorities to signal your focus for each session.{" "}
        </p>
      </Col>
    </Row>

    <h3 className={`text-left fw-bold mb-4 ${styles.missionheader}`}>
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

    <h3 className={`text-left fw-bold mb-4 ${styles.missionheader}`}>
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

    <h3 className={`text-left fw-bold mb-4 ${styles.missionheader}`}>
      See what everyone&apos;s saying
    </h3>
    <Row className="mb-3">
      <Col>
        <p>
          Even if you don&amp;t sign in, you can use MAPLE to browse testimony
          submitted on any bill. Get a lay of the land and Track public opinion
          at a glance using our endorse / oppose ratios. Read the full testimony
          of any user to find other stakeholders you may want to connect with or
          learn from.{" "}
        </p>
      </Col>
    </Row>

    <h3 className={`text-left fw-bold mb-4 ${styles.missionheader}`}>
      Curate your testimony history
    </h3>
    <Row className="mb-3">
      <Col>
        <p>
          When you submit your testimony through MAPLE, it automatically appears
          in an indexed &amp; organized listing on your profile page. Use your
          profile to automatically generate a listing of your lobbying efforts
          for your website, for member communications, or for semi-annual
          filings. You can also publish previously submitted tesitmony on MAPLE
          at any time.{" "}
        </p>
      </Col>
    </Row>

    <h3 className={`text-left fw-bold mb-4 ${styles.missionheader}`}>
      Speed up your legislative research
    </h3>
    <Row className="mb-3">
      <Col>
        <p>
          MAPLE is fast. (Really fast.) Try{" "}
          <a href="bills">searching for a bill</a> to see just how much MAPLE
          can speed up your legislative research process; no sign in required!{" "}
        </p>
      </Col>
    </Row>

    <h3 className={`text-left fw-bold mb-4 ${styles.missionheader}`}>
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
        <h3 className={`fw-bold mt-3 ${styles.submittestimony}`}>
          Ready to sign up for MAPLE? Click here!
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

export { WhyMAPLECardContent, BenefitsCardContent }
