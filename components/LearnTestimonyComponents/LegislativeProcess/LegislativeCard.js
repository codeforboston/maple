import Card from "react-bootstrap/Card"
import styles from "./LegislativeCard.module.css"

const LegislativeCard = ({ title, children }) => {
  return (
    <Card className={styles.card}>
       <Card.Title as="h2" className={`mx-auto ${styles.title}`}>
          {title}
        </Card.Title>
      <Card.Body className={styles.body}>{children}</Card.Body>
    </Card>
  )
}

export default LegislativeCard
