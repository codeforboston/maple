import Image from "react-bootstrap/Image"
import styles from "./LegislativeCard.module.css"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"

const LegislativeCardContent = ({ children, src, alt, index }) => {
  return (
    <Container fluid>
      <Row className="align-items-center flex-row-reverse">
        <Col xs={12} md={8}>
          <p>{children.P1}</p>
        </Col>
        <Col
          className={`text-center align-self-center justify-content-xs-center ${styles.colRow}`}
          lg={{ order: 2 }}
        >
          <div className={`h1 ${styles.text}`}>
            <Image fluid src={src} alt={alt} className={`${styles.image}`} />
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default LegislativeCardContent
