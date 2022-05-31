import { Container, Row, Col, Button, Image } from "react-bootstrap"
import styles from "./HeroHeader.module.css"
import { Wrap } from "../links"
import { SignInWithModal } from "../auth"

const HeroHeader = ({ authenticated }) => {
  return (
    <Container fluid className={styles.container}>
      <Row>
        <Col xs={{ order: "last", span: 12 }} md={{ order: "first", span: 6 }}>
          <Image fluid src="statehouse.png" alt="statehouse"></Image>
        </Col>
        <Col
          className="text-start mr-3 pt-2"
          xs={{ order: "first", span: 12 }}
          md={{ order: "last", span: 6 }}
        >
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
                <Button className="btn-secondary">Browse</Button>
              </div>
            </Wrap>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default HeroHeader
