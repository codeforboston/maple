import { useEffect, useState } from "react"
import { Image, Collapse } from "../bootstrap"
import { useTranslation } from "next-i18next"

type faqQandAProps = {
  question: string
  answer: string
}

export const FaqQandAButton = ({ question, answer }: faqQandAProps) => {
  const { t } = useTranslation("common")
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
            <Image src="/minus.svg" className={`me-2`} alt={t("hideAns")} />
          ) : (
            <Image src="/add.svg" className={`me-2`} alt={t("showAns")} />
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
