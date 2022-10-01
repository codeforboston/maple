import Image from "react-bootstrap/Image"
import styles from "./LearnTestimoniesCard.module.css"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"

const LearnTestimoniesCardContent = ({ children, src, alt, index }) => {
  return (
    <Container fluid>
      <Row className="my-auto">
        <Col
          className={`align-self-center ${styles.colRow}`}
          md={6}
          lg={{ order: index % 2 == 0 ? 1 : 4 }}
        >
          <Image fluid src={src} alt={alt} />
        </Col>
        <Col
          className={`text-center align-self-center justify-content-xs-center ${styles.colRow}`}
          lg={{ order: 2 }}
        >
          <p className={`h1 ${styles.text}`}>{children.P1}</p>
        </Col>
      </Row>
    </Container>
  )
}

export default LearnTestimoniesCardContent
