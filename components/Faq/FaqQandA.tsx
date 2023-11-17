import { useState } from "react"
import { Image, Collapse } from "../bootstrap"
import styles from "./Faq.module.css"

type faqQandAProps = {
  question: string
  answer: string
}

export const FaqQandA = ({ question, answer }: faqQandAProps) => {
  const [isOpen, setOpen] = useState(false)

  return (
    <>
      <div
        onClick={() => setOpen(!isOpen)}
        aria-controls="collapse-text"
        aria-expanded={isOpen}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {isOpen ? (
            <Image
              src="/minus.svg"
              className={styles.icon}
              alt="minus icon"
            ></Image>
          ) : (
            <Image
              src="/add.svg"
              className={styles.icon}
              alt="plus icon"
            ></Image>
          )}
          {question}
        </div>
      </div>
      <Collapse in={isOpen}>
        <p id="collapse-text" className={styles.answer}>
          {answer}
        </p>
      </Collapse>
    </>
  )
}
