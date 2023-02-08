import { Row, Col } from "../../bootstrap"
import Image from "react-bootstrap/Image"
import styles from "./ForLegislatorsCardContent.module.css"
import { SignInWithButton } from "../../auth"
import Link from "next/link"

const WhyMAPLECardContent = () => (
  <>
    <h3 className={`text-right fw-bold mt-3 ${styles.calltoaction}`}>
      MAPLE is a free, nonpartisan, nonprofit platform that makes it easy for
      legislative offices to see what constituents from around the Commonwealth
      are saying about bills sitting in any Committee.
    </h3>
    <p>
      Even before you create your own account, you can search our lightning-fast
      platform for all testimony submitted by MAPLE users about any bill. Our
      advanced featurs let you filter to bills sponsored by your office, bills
      concerning your city, or bills that you choose to follow.
    </p>
    <p>
      Why trust MAPLE? We are a nonpartisan, nonprofit, volunteer-developed
      civic technology initiative focused on increasing engagement between the
      legislature and its constituents. We offer our product as an open source
      public good; we are committed not to charging our users and we will never
      sell the data from our platform.
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
        <p>
          When you visit any bill page on MAPLE, you can see every piece of
          testimony submitted by MAPLE users along with their district
          information. You can easily seek out your own constiuents&apos;
          testimony and see how opinions vary across the Commonwealth.
        </p>
      </Col>
    </Row>

    <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
      See testimony on all bills before all committees in one place
    </h3>
    <Row className="mb-3">
      <Col>
        <p>
          MAPLE makes it easy for users to submit testimony on any bill, before
          any committee, Anyone can see testimony on a bill as soon as it is
          submitted.
        </p>
      </Col>
    </Row>

    <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
      Simplify the testimony process for your constituents
    </h3>
    <Row className="mb-3">
      <Col>
        <p>
          Do your constituents need assistance finding the right committee, the
          right chairperson, and the right email address to submit their
          testimony on a bill? Send them to MAPLE! Our platform makes it easy
          for anyone to direct their testimony to the right committee
          chairpersons as well as to their own constituents.
        </p>
      </Col>
    </Row>

    <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
      Extend access to constituents who speak any language
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
      Get access to advanced bill &amp; testimony statistics
    </h3>
    <Row className="mb-3">
      <Col>
        <p>
          Go beyond the text of written testimony. MAPLE&apos;s bill pages show
          you how many people support and oppose legislation, how that opinion
          has changed over time, how many people have submitted testimony, and
          how interest and support is distributed across the state.
        </p>
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
