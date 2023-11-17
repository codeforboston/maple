import { Card } from "../bootstrap"
import { FaqQandA } from "./FaqQandA"
import styles from "./Faq.module.css"

interface faqCardProps {
  faqId: number
  heading: string
  qAndAs: { disabled?: boolean; question: string; answer: string }[]
}

export const FaqCard = ({ faqId, heading, qAndAs }: faqCardProps) => {
  return (
    <Card className={styles.faqCard}>
      {heading == "General" ? (
        <span className={styles.mobileOffset} id={heading} />
      ) : (
        <span id={heading} />
      )}
      <h2>{heading ?? ""}</h2>
      <hr></hr>
      {qAndAs.map(
        (qAndA, index) =>
          typeof qAndA.disabled === "undefined" && (
            <div className={styles.faqQA} key={index}>
              <FaqQandA
                key={faqId}
                question={qAndA.question}
                answer={qAndA.answer}
              ></FaqQandA>
            </div>
          )
      )}
    </Card>
  )
}
