import { useEffect, useState } from "react"
import { Image, Collapse } from "../bootstrap"
import styles from "./Faq.module.css"

type faqQandAProps = {
  question: string
  answer: string
}

export const FaqQandA = ({ question, answer }: faqQandAProps) => {
  const [open, setOpen] = useState(false)

  useEffect(() => {}, [open])

  return (
    <>
      <a
        onClick={() => setOpen(!open)}
        aria-controls="example-collapse-text"
        aria-expanded={open}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {open ? (
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
      </a>
      <Collapse in={open}>
        <p id="example-collapse-text" className={styles.answer}>
          {answer}
        </p>
      </Collapse>
    </>
  )
}
