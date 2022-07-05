import { SignInWithModal } from "../auth"
import { Button, Col, Container, Image, Row } from "../bootstrap"
import { Wrap } from "../links"
import ScrollTrackerContainer from "../ScrollTrackEffect/ScrollTrackerContainer"
import ScrollTrackingItem from "../ScrollTrackEffect/ScrollTrackerItem"
import styles from "./HeroHeader.module.css"

const HeroHeader = ({ authenticated }) => {
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
              src="skyline.png"
              alt=""
            ></Image>
          </ScrollTrackingItem>
          <ScrollTrackingItem
            speed={-0.2}
            className={`${styles.cloudsContainer}`}
          >
            <Image
              className={`${styles.clouds} opacity-50`}
              src="clouds.png"
              alt=""
            ></Image>
          </ScrollTrackingItem>
          <Col>
            <Row>
              <Col
                className={`d-grid z-index-3 align-items-center justify-content-center`}
                xs={{ order: "last", span: 12 }}
                md={{ order: "first", span: 6 }}
              >
                <Image
                  className={`${styles.statehouse}`}
                  src="statehouse.png"
                  alt="statehouse"
                ></Image>
              </Col>
              <Col
                className="text-start mr-3 pt-2 z-index-3"
                xs={{ order: "first", span: 12 }}
                md={{ order: "last", span: 6 }}
              >
                <div className={`m-5`}>
                  <h1>
                    <em>Let your voice be heard!</em>
                  </h1>
                  <p className="lead">
                    MAPLE makes it easy for anyone to view and submit testimony to the
                    Massachusetts Legislature about the bills that will shape our
                    future.
                  </p>
                  <div className="text-end m-5">
                    {!authenticated && (
                      <div className={styles.btncontainer}>
                        <SignInWithModal label="Sign in to Testify" />
                      </div>
                    )}
                    <Wrap href="/bills">
                      <div className={styles.btncontainer}>
                        <Button variant="outline-secondary">Browse</Button>
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
