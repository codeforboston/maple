import { Col, Image } from "../../bootstrap"
import styles from "./BasicsOfTestimonyCard.module.css"

export type BasicsOfTestimonyCardProps = {
  title: string
  index: number
  alt: string
  paragraph: string
  src: string
}

const BasicsOfTestimonyCard = ({ title, index, alt, paragraph, src }: BasicsOfTestimonyCardProps) => {
  return (
    <div className={styles.card}>
      <Col
        className={styles.image}
        md={6}
        lg={{ order: index % 2 == 0 ? 0 : 5 }}
      >
        <Image
          fluid
          className={index % 2 == 0 ? styles.imageLeft : styles.imageRight}
          src={src}
          alt={alt}
        />
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

export default BasicsOfTestimonyCard
