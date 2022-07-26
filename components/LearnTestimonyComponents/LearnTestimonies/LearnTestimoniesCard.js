import Card from "react-bootstrap/Card"
import styles from "./LearnTestimoniesCard.module.css"

const LearnTestimoniesCard = ({ title, children }) => {
  return (
    <Card className={styles.card}>
      <Card.Header
        as="h1"
        className={`text-center text-white ${styles.header}`}
      >
        {title}
      </Card.Header>
      <Card.Body className={styles.cardBody}>{children}</Card.Body>
    </Card>
  )
}

export default LearnTestimoniesCard
