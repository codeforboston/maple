import { Card } from "../bootstrap"
import styles from "./WritingEffectiveTestimoniesCard.module.css"

const WritingEffectiveTestimoniesCard = ({ title, children }) => {
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

export default WritingEffectiveTestimoniesCard
