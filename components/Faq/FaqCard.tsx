import { Card } from "../bootstrap"
import { FaqQandA } from "./FaqQandA"
import styles from "./Faq.module.css"

type faqCardProps = {
  heading: string
  qAndAs: { disabled?: boolean; question: string; answer: string }[]
}

export const FaqCard = ({ heading, qAndAs }: faqCardProps) => {
  return (
    <Card className={styles.faqCard}>
      <h2>{heading ?? ""}</h2>
      <hr></hr>
      {qAndAs.map(
        (key, index) =>
          typeof key.disabled === "undefined" && (
            <div className={styles.faqQA} key={index}>
              <FaqQandA
                key={index}
                question={key.question}
                answer={key.answer}
              ></FaqQandA>
            </div>
          )
      )}
    </Card>
  )
}
