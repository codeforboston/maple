import { Row, Col } from "../bootstrap"
import Image from "react-bootstrap/Image"
import styles from "./ForTestifiersCardContent.module.css"
import { SignInWithModal } from "../auth"
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
      {!authenticated && (
        <div className={styles.btncontainer}>
          <SignInWithModal label="Click here to sign up for your MAPLE account" />
        </div>
      )}
    </h3>
    <h3 className={`text-right fw-bold mt-3 ${styles.calltoaction}`}>
      <a href="mailto:mapletestimony@gmail.com">
        Any questions? Reach out to mapletestimony@gmail.com
      </a>
    </h3>
  </>
)

export { WhyMAPLECardContent, BenefitsCardContent, ChallengeCardContent }
