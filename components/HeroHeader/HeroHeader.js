import { AltSignInWithButton } from "components/auth/SignInWithButton"
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
              src="/skyline.svg"
              alt=""
            ></Image>
          </ScrollTrackingItem>
          <ScrollTrackingItem
            speed={-0.2}
            className={`${styles.cloudsContainer}`}
          >
            <Image
              className={`${styles.clouds} opacity-50`}
              src="/clouds.svg"
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
                  src="/statehouse.svg"
                  alt=""
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
                  <p>
                    {t("newcomer")}{" "}
                    <a
                      href="https://calendar.google.com/calendar/embed?src=998f62323926f0b0076e7f578d3ca72b1bc94c4efa2f24be57b11f52b1b88595%40group.calendar.google.com&ctz=America%2FNew_York"
                      style={{ color: "white" }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("calendar")}
                    </a>{" "}
                    {t("joinTraining")}
                  </p>
                  <p>
                    <a
                      href="https://cdn.forms-content.sg-form.com/fc8a7d49-d903-11ed-9e53-c2519c5b83a4"
                      style={{ color: "white" }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("newsletter")}
                    </a>
                  </p>
                  <div className="text-end m-5">
                    {!authenticated && (
                      <div className={styles.btncontainer}>
                        <AltSignInWithButton />
                      </div>
                    )}
                    <Wrap href="/bills">
                      <div className={styles.btncontainer}>
                        <Button variant="light" className="text-secondary">
                          {capitalize(t("browse_bills"))}
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
