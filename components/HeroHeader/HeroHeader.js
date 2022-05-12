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
        <Col className="text-end mr-3">
          <h1>
            <em>Let your voice be heard!</em>
          </h1>
          <h3>Value prop here</h3>
          <Button variant="danger">Sign In to Testify</Button>
          <Button variant="light">Browse</Button>
        </Col>
      </Row>
    </Container>
  )
}

export default HeroHeader
