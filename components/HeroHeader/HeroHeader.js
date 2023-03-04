import { SignInWithButton } from "../auth"
import { Button, Col, Container, Image, Row } from "../bootstrap"
import { Wrap } from "../links"
import ScrollTrackerContainer from "../ScrollTrackEffect/ScrollTrackerContainer"
import ScrollTrackingItem from "../ScrollTrackEffect/ScrollTrackerItem"
import styles from "./HeroHeader.module.css"
import { useTranslation } from "next-i18next"
import { capitalize } from "lodash"

const HeroHeader = ({ authenticated }) => {
  const { t } = useTranslation("common")

  return (
    <Container fluid className={`${styles.container}`}>
      <ScrollTrackerContainer>
        <Row>
          <ScrollTrackingItem
            className={`${styles.skylineContainer}`}
            speed={0.6}
          >
            <Image
              className={`${styles.skyline}`}
              src="/skyline.png"
              alt=""
            ></Image>
          </ScrollTrackingItem>
          <ScrollTrackingItem
            speed={-0.2}
            className={`${styles.cloudsContainer}`}
          >
            <Image
              className={`${styles.clouds} opacity-50`}
              src="/clouds.png"
              alt=""
            ></Image>
          </ScrollTrackingItem>
          <Col style={{ zIndex: "10" }}>
            <Row>
              <Col
                className={`d-grid align-items-center justify-content-center`}
                xs={{ order: "last", span: 12 }}
                md={{ order: "first", span: 6 }}
              >
                <Image
                  className={`${styles.statehouse}`}
                  src="/statehouse.png"
                  alt="statehouse"
                ></Image>
              </Col>
              <Col
                className="text-start mr-3 pt-2"
                xs={{ order: "first", span: 12 }}
                md={{ order: "last", span: 6 }}
              >
                <div className={`m-5`}>
                  <div className={styles.title}>
                    {t("common:let_your_voice_be_heard")}
                  </div>
                  <p className={styles.subtitle}>{t("short_description")}</p>
                  <div className="text-end m-5">
                    {!authenticated && (
                      <div className={styles.btncontainer}>
                        <SignInWithButton label="Sign in to Testify" />
                      </div>
                    )}
                    <Wrap href="/bills">
                      <div className={styles.btncontainer}>
                        <Button variant="outline-secondary">
                          {capitalize(t("browse"))}
                        </Button>
                      </div>
                    </Wrap>
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </ScrollTrackerContainer>
    </Container>
  )
}

export default HeroHeader
