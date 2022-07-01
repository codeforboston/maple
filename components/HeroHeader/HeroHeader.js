import { Button, Col, Container, Image, Row } from "react-bootstrap"
import { SignInWithModal } from "../auth"
import { Wrap } from "../links"
import styles from "./HeroHeader.module.css"

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
        </Col>
      </Row>
    </Container>
  )
}

export default HeroHeader
