import styles from "./RoleOfTestimonyCard.module.css"
import Image from "react-bootstrap/Image"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"

const RoleOfTestimonyCard = ({ title, index, alt, paragraph, src }) => {
  return (
    <div className={styles.card}>
      <Row className="my-auto">
        <Col
          className={styles.image}
          sm={{ span: 12, order: 0 }}
          md={{ order: index % 2 == 0 ? 0 : 5 }}
        >
          <Image fluid className={styles.imageItself} src={src} alt={alt} />
        </Col>
        <Col
          className={index % 2 == 0 ? styles.textRight : styles.textLeft}
          sm={{ span: 12, order: 1 }}
          md={{ span: 6, order: 3 }}
        >
          <div className={styles.title}>{title}</div>
          <div className={styles.content}>{paragraph}</div>
        </Col>
      </Row>
    </div>
  )
}

export default RoleOfTestimonyCard
