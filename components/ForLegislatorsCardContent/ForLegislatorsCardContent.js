import { Row, Col } from "../bootstrap"
import Image from "react-bootstrap/Image"
import styles from "./ForLegislatorsCardContent.module.css"
import { SignInWithModal } from "../auth"
import Link from "next/link"

const WhyMAPLECardContent = () => (
  <>
    <h3 className={`text-right fw-bold mt-3 ${styles.calltoaction}`}>
      MAPLE is a free, nonpartisan, nonprofit platform that makes it easier for
      legislative offices to see what constituents from around the Commonwealth
      are saying about bills sitting in any Committee.
    </h3>
    <p>
      Even before you create your own account, you can search our lightning-fast
      platform for all testimony submitted by MAPLE users about any bill. Our
      advanced featurs let you filter to bills sponsored by your office, bills
      concerning your city, or bills that you choose to follow.
    </p>
  </>
)

const BenefitsCardContent = () => (
  <>
    <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
      Find out what constituents are saying about your priority bills
    </h3>
    <Row className="mb-3">
      <Col>
        <p>Lorem Ipsum.</p>
      </Col>
    </Row>
  </>
)

const ChallengeCardContent = () => (
  <>
    <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`} id="clo">
      Start using MAPLE today to put your finger on the pulse of your
      constituents!
    </h3>
    <p>
      You can browse testimony submitted by constituents across the state on
      MAPLE, with or without creating your own account.
    </p>
    <h3 className={`text-right fw-bold mt-3 ${styles.calltoaction}`}>
      <a href="mailto:mapletestimony@gmail.com">
        Any questions? We&apos;re here to help&mdash;reach out to
        mapletestimony@gmail.com
      </a>
    </h3>
  </>
)

export { WhyMAPLECardContent, BenefitsCardContent, ChallengeCardContent }
