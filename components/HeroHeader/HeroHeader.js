import { Container, Row, Col, Button, Image } from "react-bootstrap"
import styles from "./HeroHeader.module.css"

const HeroHeader = () => {
  //button on line 14 will have to be changed in future to have blue font
  return (
    <Container fluid className={styles.container}>
      <Row>
        <Col>
          <Image fluid src="statehouse.png" alt="statehouse"></Image>
        </Col>
        <Col className="text-start mr-3 pt-2">
          <h1>
            <em>Let your voice be heard!</em>
          </h1>
          <h3>Value prop here on why people should sign up for this</h3>
          <div className="text-end m-5">
            <div className={styles.btncontainer}>
              <Button className="btn-primary">Sign In to Testify</Button>
            </div>
            <div className={styles.btncontainer}>
              <Button className="btn-secondary">Browse</Button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default HeroHeader
