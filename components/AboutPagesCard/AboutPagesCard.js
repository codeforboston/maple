import { Card } from "../bootstrap"
import styles from "./AboutPagesCard.module.css"

const AboutPagesCard = ({ title, children }) => {
  return (
    <Card className={styles.card}>
      <Card.Header as="h3" className={`text-center fw-bold ${styles.header}`}>
        {title}
      </Card.Header>
      <Card.Body>{children}</Card.Body>
    </Card>
  )
}

export default AboutPagesCard
