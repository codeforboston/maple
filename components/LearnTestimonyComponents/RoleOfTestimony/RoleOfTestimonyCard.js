import styles from "./RoleOfTestimonyCard.module.css"
import Image from "react-bootstrap/Image"
import Col from "react-bootstrap/Col"

const RoleOfTestimonyCard = ({ title, index, alt, paragraph, src }) => {
  return (
    <div className={styles.card}>
      <Col
        className={styles.image}
        md={6}
        lg={{ order: index % 2 == 0 ? 0 : 5 }}
      >
        <Image fluid className={styles.imageItself} src={src} alt={alt} />
      </Col>
      <Col
        className={index % 2 == 0 ? styles.textRight : styles.textLeft}
        lg={{ order: 3 }}
      >
        <div className={styles.title}>{title}</div>
        <div className={styles.content}>{paragraph}</div>
      </Col>
    </div>
  )
}

export default RoleOfTestimonyCard
