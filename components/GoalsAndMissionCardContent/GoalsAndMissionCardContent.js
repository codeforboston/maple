import { Row, Col } from "../bootstrap"
import Image from "react-bootstrap/Image"
import styles from "./GoalsAndMissionCardContent.module.css"
import { SignInWithModal } from "../auth"

const OurGoalsCardContent = () => (
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
            src="/gov_key.png"
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
            src="/doc_arrows_people.png"
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
            src="/doc_arrows_people.png"
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
            src="/gov_key.png"
            alt="government building with key"
          />
        </div>
        <p className="fw-bold">Promote transparency in government</p>
      </Col>
    </Row>
  </>
)

const OurMissionCardContent = () => (
  <>
    <h3 className={`text-center fw-bold mb-4 ${styles.missionheader}`}>
      Increase the transparency of the legislative process in Massachusetts
    </h3>
    <Row className="mb-5">
      <Col>
        <p>
          A core goal of the MAPLE platform (this website) is to increase the
          transparency of the legislative process in MA. In short, we want to
          know what information the Legislature considered when reaching a
          conclusion about a bill.{" "}
        </p>
      </Col>
      <Col className="text-center">
        <Image
          className={styles.imgsize}
          fluid
          src="/leg_magnifying_glass.png"
          alt="document with magnifying glass"
        />
      </Col>
    </Row>
    <Row className="mb-4">
      <Col>
        <Image
          className={styles.imgsize}
          fluid
          src="/doc_treasure_box.png"
          alt="document with magnifying glass"
        />
      </Col>
      <Col className="text-end">
        <p>
          Today, there is no legal obligation for the Legislature to disclose
          what written testimony they receive and, in practice, such disclosure
          very rarely happens. As a result, it can be difficult to compare
          legislative outcomes to the interests and demands of constituents,
          which is an important tenant of accountability for legislators.{" "}
        </p>
      </Col>
    </Row>
    <Row className="mb-3">
      <Col>
        <p>
          When you submit testimony via the MAPLE platform, you can publish it
          in a freely accesible online database (this website) so that all other
          stakeholders can read your perspective. We hope this will increase the
          overall transparency of the legislative process and lead to better
          policy outcomes, with greater alignment to the needs, values, and
          objectives of the population of Massachusetts. While you certainly do
          not have to submit testimony via this website, we hope you will. Every
          piece of testimony published to this site increases the transparency
          of the legislative process.
        </p>
      </Col>
    </Row>
    <Row className="text-center mb-5">
      <Col>
        <Image
          className={styles.imgsize}
          fluid
          src="/step_1.png"
          alt="step 1 of the legislative process"
        />
      </Col>
      <Col>
        <Image
          className={styles.imgsize}
          fluid
          src="/step_2.png"
          alt="step 2 of the legislative process"
        />
      </Col>
      <Col>
        <Image
          className={styles.imgsize}
          fluid
          src="/step_3.png"
          alt="step 3 of the legislative process"
        />
      </Col>
    </Row>
    <Row className="text-center">
      <Col>
        <h3 className={`fw-bold mt-3 ${styles.submittestimony}`}>
          Submit your testimony now!
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

export { OurGoalsCardContent, OurMissionCardContent }
