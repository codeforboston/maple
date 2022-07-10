import { Card } from "../bootstrap"
import styles from "./AdditionalResourcesCard.module.css"

const AdditionalResourcesCard = ({ children }) => {
  return (
    <Card className={styles.card}>
      <Card.Body className={styles.cardBody}>{children}</Card.Body>
    </Card>
  )
}

export default AdditionalResourcesCard
