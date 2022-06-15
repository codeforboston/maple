import { SignInWithModal } from "../auth"
import { Button, Col, Image, Row, Container } from "../bootstrap"
import { Wrap } from "../links"
import ScrollTrackerContainer from "../ParallaxEffect/ParallaxContainer"
import { ParallaxItem, ParallaxColumn } from "../ParallaxEffect/ParallaxLayer"
import styles from "./HeroHeader.module.css"

const HeroHeader = ({ authenticated }) => {
  return (
    <Container fluid className={`${styles.container}`}>
      <ScrollTrackerContainer>
        <Row className={`${styles.infoRow}`}>
            <ParallaxItem className={``} speed={0.6}>
              <Image className={`${styles.skyline}`} src="skyline.png" alt=""></Image>
            </ParallaxItem>
            <ParallaxItem speed={-0.2}>
              <Image className={`${styles.clouds} `} src="clouds.png" alt=""></Image>
            </ParallaxItem>
          <Col>
            <Row>
              <Col className={`border border-4 border-primary d-grid`} xs={{ order: "last", span: 12 }} md={{ order: "first", span: 6 }}>
                <Image className={`${styles.statehouse} `} src="statehouse.png" alt="statehouse"></Image>
              </Col>
              <Col
                className="text-start mr-3 pt-2 border border-3"
                xs={{ order: "first", span: 12 }}
                md={{ order: "last", span: 6 }}
              >
                <div className={`align-self-center`}>
                  <h1>
                    <em>Let your voice be heard!</em>
                  </h1>
                  <p className="lead">
                    This is where we will put a value prop here on why people should
                    sign up for this
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
