import { Row, Col } from "../bootstrap"
import Image from "react-bootstrap/Image"
import styles from "./CommunicatingWithLegislators.module.css"
import { SignInWithModal } from "../auth"

const WritingContent = () => (
  <Row className="align-items-center">
    <Col xs={12} md={8}>
      <p>
        You can submit your thoughts on a bill to the Committee hearing it
        before the date of their public hearing. This website, the MAPLE
        platform, focuses on this mechanism.
      </p>
    </Col>
    <Col md={4} className={styles.imageParent}>
      <Image
        className={`float-md-end ${styles.image}`}
        fluid
        src="/computertextblob.png"
        alt="computer display with lines representing text"
      />
    </Col>
  </Row>
)

const OralContent = () => (
  <Row className="align-items-center">
    <Col xs={{ span: 12, order: 2 }} md={{ span: 4, order: 0 }}>
      <Image
        className={styles.image}
        fluid
        src="/micandpaper.png"
        alt="microphone next to a sheet of paper"
      />
    </Col>
    <Col xs={{ span: 12, order: 1 }} md={{ span: 8, order: 1 }}>
      <p>
        You can attend a public hearing for a bill of interest to you and sign
        up for a slot to speak before the Committee.
      </p>
    </Col>
  </Row>
)

const WriteOrCallContent = () => (
  <Row className="align-items-center">
    <Col xs={12} md={8}>
      <p>
        You can contact your legislators any time by looking up their contact
        information on the MA Legislature website. Your voice will probably
        carry the most weight with the House and Senate representatives of your
        own district, but you are free to contact Committee Chairs or any other
        member of the legislature with your opinions. You could request a
        meeting in person.
      </p>
    </Col>
    <Col md={4} className={styles.imageParent}>
      <Image
        className={`float-md-end ${styles.image}`}
        fluid
        src="/envelopewithletter.png"
        alt="envelope with letter sticking out"
      />
    </Col>
  </Row>
)

export { WritingContent, OralContent, WriteOrCallContent }
