import { Row, Col } from "../bootstrap"
import Image from "react-bootstrap/Image"
import styles from "./OurGoalsAndMissionCardContent.module.css"

const OurGoalsCardContent = (
  <>
    <p>
      By creating an accessible platform for submitting testimony on legislation
      in MA via a transparent archive of public testimony, we aim to achieve
      these goals:
    </p>
    <Row className="mb-4">
      <Col>
        <div className="text-center mb-3">
          <Image
            className={styles.imgsize}
            fluid
            src="gov_key.png"
            alt="government building with key"
          />
        </div>
        <p className="fw-bold">Increase access to the legislative process</p>
      </Col>
      <Col>
        <div className="text-center mb-3">
          <Image
            className={styles.imgsize}
            fluid
            src="doc_arrows_people.png"
            alt="government building with key"
          />
        </div>
        <p className="fw-bold">
          Engage a wider set of stakeholders and perspectives in policymaking
        </p>
      </Col>
    </Row>
    <Row>
      <Col>
        <div className="text-center mb-3">
          <Image
            className={styles.imgsize}
            fluid
            src="doc_arrows_people.png"
            alt="government building with key"
          />
        </div>
        <p className="fw-bold">
          Distribute information about pending legislation
        </p>
      </Col>
      <Col>
        <div className="text-center mb-3">
          <Image
            className={styles.imgsize}
            fluid
            src="gov_key.png"
            alt="government building with key"
          />
        </div>
        <p className="fw-bold">Promote transparency in government</p>
      </Col>
    </Row>
  </>
)

export default OurGoalsCardContent
