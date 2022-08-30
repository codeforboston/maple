import { Row, Col } from "../bootstrap"
import Image from "react-bootstrap/Image"
import styles from "./GoalsAndMissionCardContent.module.css"
import { SignInWithModal } from "../auth"

const OurGoalsCardContent = () => (
  <>
    <h3 className={styles.goalsHeader}>
      By creating an accessible platform for submitting testimony on legislation
      in MA via a transparent archive of public testimony, we aim to achieve
      these goals:
    </h3>
    <Row className="mb-4">
      <Col md={6}>
        <figure className="text-center mb-3">
          <Image
            className={styles.imgsize}
            fluid
            src="/gov_key.png"
            alt="government building with key"
          />
          <figcaption className={`fw-bold ${styles.caption}`}>
            Increase access to the legislative process
          </figcaption>
        </figure>
      </Col>
      <Col md={6}>
        <figure className="text-center mb-3">
          <Image
            className={styles.imgsize}
            fluid
            src="/doc_arrows_people.png"
            alt="government building with key"
          />
          <figcaption className={`fw-bold ${styles.caption}`}>
            Engage a wider set of stakeholders and perspectives in policymaking
          </figcaption>
        </figure>
      </Col>
    </Row>
    <Row>
      <Col md={6}>
        <figure className="text-center mb-3">
          <Image
            className={styles.imgsize}
            fluid
            src="/doc_arrows_people.png"
            alt="government building with key"
          />
          <figcaption className={`fw-bold ${styles.caption}`}>
            Distribute information about pending legislation
          </figcaption>
        </figure>
      </Col>
      <Col md={6}>
        <figure className="text-center mb-3">
          <Image
            className={styles.imgsize}
            fluid
            src="/gov_key.png"
            alt="government building with key"
          />
          <figcaption className={`fw-bold ${styles.caption}`}>
            Promote transparency in government
          </figcaption>
        </figure>
      </Col>
    </Row>
  </>
)

const OurMissionCardContent = () => (
  <>
    <h3 className={`text-center fw-bold ${styles.missionHeader}`}>
      Increase the transparency of the legislative process in Massachusetts
    </h3>
    <Row className="mb-4">
      <Col lg={8}>
        <p className={styles.body}>
          A core goal of the MAPLE platform (this website) is to increase the
          transparency of the legislative process in MA. In short, we want to
          know what information the Legislature considered when reaching a
          conclusion about a bill.{" "}
        </p>
      </Col>
      <Col lg={4} className="text-center">
        <Image
          // className={styles.missionImage}
          fluid
          src="/leg_magnifying_glass.png"
          alt="document with magnifying glass"
        />
      </Col>
    </Row>

    <Row>
      <Col className="">
        <Image
          // className={styles.imgsize}
          fluid
          src="/doc_treasure_box.png"
          alt="document with magnifying glass"
        />
      </Col>
      <Col className={`text-end ${styles.body}`}>
        <p>
          Today, there is no legal obligation for the Legislature to disclose
          what written testimony they receive and, in practice, such disclosure
          very rarely happens. As a result, it can be difficult to compare
          legislative outcomes to the interests and demands of constituents,
          which is an important tenant of accountability for legislators.{" "}
        </p>
      </Col>
    </Row>

    <Row>
      <Col>
        <p className={styles.body}>
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

    <Row className={`${styles.oneTwoThreeImage}`}>
      <Col className={`${styles.oneTwoImage}`}>
        <Image
          className=""
          fluid
          src="/step_1.png"
          alt="step 1 of the legislative process"
        />
      </Col>
      <Col className={`${styles.oneTwoImage}`}>
        <Image
          className=""
          fluid
          src="/step_2.png"
          alt="step 2 of the legislative process"
        />
      </Col>
      <Col className="">
        <Image
          className=""
          fluid
          src="/step_3.png"
          alt="step 3 of the legislative process"
        />
      </Col>
    </Row>

    <Row className="text-center">
      <Col>
        <h3 className={`fw-bold mt-3 ${styles.submitTestimony}`}>
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
