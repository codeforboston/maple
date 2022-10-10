import { Row, Col } from "../bootstrap"
import styles from "./AdditionalResourcesCard.module.css"
import Container from "react-bootstrap/Container"

const AdditionalResourcesCardContent = ({ children }) => {
  return (
    <Container fluid>
      <Row className="my-auto">
        <Col
          className={`text-center align-self-center justify-content-xs-center ${styles.colRow}`}
        >
          <p className={`h1 ${styles.text}`}>{children.P1}</p>
        </Col>
      </Row>
    </Container>
  )
}

export default AdditionalResourcesCardContent
