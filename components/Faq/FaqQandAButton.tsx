import { useEffect, useState } from "react"
import { Image, Collapse } from "../bootstrap"

type faqQandAProps = {
  question: string
  answer: string
}

export const FaqQandAButton = ({ question, answer }: faqQandAProps) => {
  const [open, setOpen] = useState(false)

  useEffect(() => {}, [open])

  return (
    <>
      <a
        onClick={() => setOpen(!open)}
        aria-controls="example-collapse-text"
        aria-expanded={open}
      >
        <div className={`align-items-center d-flex mt-4`}>
          {open ? (
            <Image src="/minus.svg" className={`me-2`} alt="minus icon" />
          ) : (
            <Image src="/add.svg" className={`me-2`} alt="plus icon" />
          )}
          {question}
        </div>
      </a>
      <Collapse in={open}>
        <p id="example-collapse-text" className={`mt-3 mb-0`}>
          {answer}
        </p>
      </Collapse>
    </>
  )
}
