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
        <Row className={``}>
          <ParallaxItem className={`bottom-0 border border-5 border-primary`} speed={0.6}>
            <Image className={`${styles.skyline} position-relative  border`} src="skyline.png" alt=""></Image>
          </ParallaxItem>
          <ParallaxItem speed={-0.2} className={``}>
            <Image className={`${styles.clouds} opacity-50 position-relative translate-middle top-50 start-50`} src="clouds.png" alt=""></Image>
          </ParallaxItem>
          <Col>
            <Row>
              <Col className={`d-grid z-index-3 border align-items-center justify-content-center`} xs={{ order: "last", span: 12 }} md={{ order: "first", span: 6 }}>
                <Image className={`position-relative start-50 top-50 translate-middle h-75`} src="statehouse.png" alt="statehouse"></Image>
              </Col>
              <Col
                className="text-start mr-3 pt-2 z-index-3"
                xs={{ order: "first", span: 12 }}
                md={{ order: "last", span: 6 }}
              >
                <div className={`m-5`}>
                  <h1 >
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
