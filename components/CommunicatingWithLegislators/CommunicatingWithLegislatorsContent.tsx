import { Row, Col } from "../bootstrap"
import Image from "react-bootstrap/Image"
import styles from "./CommunicatingWithLegislators.module.css"
import { SignInWithModal } from "../auth"

const WritingContent = () => (
  <>
    <Row>
      <p className={styles.sectiondetails}>
        You can submit your thoughts on a bill to the Committee hearing it
        before the date of their public hearing. This website, the MAPLE
        platform, focuses on this mechanism.
      </p>
      <Image
        className={styles.imgsize}
        fluid
        src="computertextblob.png"
        alt="computer display with lines representing text"
      />
    </Row>
  </>
)

const OralContent = () => (
  <>
    <Row>
      <p className={styles.sectiondetails}>
        You can attend a public hearing for a bill of interest to you and sign
        up for a slot to speak before the Committee.
      </p>
      <Image
        className={styles.imgsize}
        fluid
        src="micandpaper.png"
        alt="microphone next to a sheet of paper"
      />
    </Row>
  </>
)

const WriteOrCallContent = () => (
  <>
    <Row>
      <p className={styles.sectiondetails}>
        You can contact your legislators any time by looking up their contact
        information on the MA Legislature website. Your voice will probably
        carry the most weight with the House and Senate representatives of your
        own district, but you are free to contact Committee Chairs or any other
        member of the legislature with your opinions. You could request a
        meeting in person.
      </p>
      <Image
        className={styles.imgsize}
        fluid
        src="envelopewithletter.png"
        alt="envelope with letter sticking out"
      />
    </Row>
  </>
)

export { WritingContent, OralContent, WriteOrCallContent }
