import { Row, Col } from "../bootstrap"
import Image from "react-bootstrap/Image"
import styles from "./GoalsAndMissionCardContent.module.css"
import { SignInWithButton } from "../auth"
import { useTranslation } from "next-i18next"

const OurGoalsCardContent = () => {
  const { t } = useTranslation("goalsandmission")
  return (
    <>
      <h3 className={styles.goalsHeader}>{t("goals.overview")}</h3>
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
              {t("goals.increase")}
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
              {t("goals.engage")}
            </figcaption>
          </figure>
        </Col>
      </Row>

      <Row>
        <Col xs={{ span: 12, order: 2 }} md={{ span: 6, order: 1 }}>
          <figure className="text-center mb-3">
            <Image
              className={styles.imgsize}
              fluid
              src="/doc_arrows_people.png"
              alt="government building with key"
            />
            <figcaption className={`fw-bold ${styles.caption}`}>
              {t("goals.strengthen")}
            </figcaption>
          </figure>
        </Col>

        <Col xs={{ span: 12, order: 1 }} md={{ span: 6, order: 1 }}>
          <figure className="text-center mb-3">
            <Image
              className={styles.imgsize}
              fluid
              src="/gov_key.png"
              alt="government building with key"
            />
            <figcaption className={`fw-bold ${styles.caption}`}>
              {t("goals.encourage")}
            </figcaption>
          </figure>
        </Col>
      </Row>
    </>
  )
}

const OurMissionCardContent = () => {
  const { t } = useTranslation("goalsandmission")
  return (
    <>
      <h3 className={`text-center fw-bold ${styles.missionHeader}`}>
        {t("mission.overview")}
      </h3>

      <Row className="mb-4">
        <Col xs={{ span: 12, order: 2 }} md={{ span: 6, order: 1 }} lg={8}>
          <p className={styles.body}>{t("mission.connect")}</p>
        </Col>
        <Col
          xs={{ span: 12, order: 1 }}
          md={{ span: 6, order: 2 }}
          lg={4}
          className={`text-center`}
        >
          <Image
            className={styles.missionImages}
            fluid
            src="/leg_magnifying_glass.png"
            alt="document with magnifying glass"
          />
        </Col>
      </Row>

      <Row>
        <Col
          sm={{ span: 12, order: 1 }}
          md={{ span: 6, order: 1 }}
          lg={4}
          className="text-center"
        >
          <Image
            className={styles.missionImages}
            fluid
            src="/doc_treasure_box.png"
            alt="document with magnifying glass"
          />
        </Col>
        <Col
          sm={{ span: 12, order: 2 }}
          md={{ span: 6, order: 1 }}
          lg={8}
          className={`text-end ${styles.body}`}
        >
          <p>{t("mission.disclosure")}</p>
        </Col>
      </Row>
      <Row>
        <Col className={`p-3 ${styles.body}`}>
          <p className="text-center">{t("mission.callout")}</p>
        </Col>
      </Row>
      <Row>
        <Col>
          <p className={`${styles.testimonyDisclaimer} ${styles.body}`}>
            {t("mission.publish1")}
          </p>
          <p className={`${styles.testimonyDisclaimer} ${styles.body}`}>
            {t("mission.publish2")}
          </p>
        </Col>
      </Row>

      <Row className={`${styles.oneTwoThreeImage}`}>
        <Col
          lg={4}
          className={`text-center ${styles.one} ${styles.oneTwoImage}`}
        >
          <Image
            className={styles.stepsImages}
            fluid
            src="/step_1.png"
            alt="step 1 of the legislative process"
          />
        </Col>
        <Col
          lg={4}
          className={`text-center ${styles.two} ${styles.oneTwoImage}`}
        >
          <Image
            className={styles.stepsImages}
            fluid
            src="/step_2.png"
            alt="step 2 of the legislative process"
          />
        </Col>
        <Col
          lg={4}
          className={`text-center ${styles.three} ${styles.threeImage}`}
        >
          <Image
            className={styles.stepsImages}
            fluid
            src="/step_3.png"
            alt="step 3 of the legislative process"
          />
        </Col>
      </Row>

      <Row className="text-center">
        <Col>
          <h3 className={`fw-bold mt-3 ${styles.submitTestimony}`}>
            {t("mission.submit_now")}
          </h3>
        </Col>
      </Row>

      <Row className="text-center mb-3">
        <Col>
          <SignInWithButton />
        </Col>
      </Row>
    </>
  )
}

export { OurGoalsCardContent, OurMissionCardContent }
