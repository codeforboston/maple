import { Card } from "../bootstrap"
import styles from "./AboutPagesCard.module.css"

const AboutPagesCard = ({ title, children }) => {
  return (
    <Card className={"m-5 " + styles.card}>
      <Card.Header as="h3" className={`${styles.header}`}>
        {title}
      </Card.Header>
      <Card.Body>{children}</Card.Body>
    </Card>
  )
}

export default AboutPagesCard
