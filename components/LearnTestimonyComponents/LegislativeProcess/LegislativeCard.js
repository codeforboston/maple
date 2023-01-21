import Card from "react-bootstrap/Card"
import styles from "./LegislativeCard.module.css"

const LegislativeCard = ({ title, children }) => {
  return (
    <Card className={styles.card}>
      <Card.Header
        as="h1"
        className={`text-center text-white ${styles.header}`}
      >
        {title}
      </Card.Header>
      <Card.Body className={styles.body}>{children}</Card.Body>
    </Card>
  )
}

export default LegislativeCard
