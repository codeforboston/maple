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
          <div className={`h1 ${styles.text}`}>{children.P1 || children}</div>
        </Col>
      </Row>
    </Container>
  )
}

export default AdditionalResourcesCardContent
