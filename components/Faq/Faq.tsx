import { Container, Stack } from "../bootstrap"
import { FaqQandA } from "./FaqQandA"
import { FaqCard } from "./FaqCard"
import styles from "./Faq.module.css"
import content from "./faqContent.json"

export const Faq = () => {
  const faqData: FaqData = content
  const faqKeys: string[] = Object.keys(faqData)

  interface FaqData {
    [key: string]: string | FaqDataCard | any
  }

  interface FaqDataCard {
    heading: string
    qAndA: { question: string; answer: string }[]
  }

  return (
    <>
      <Container fluid className={styles.faqLayout}>
        <h1>FAQ</h1>
        <Stack direction="vertical" gap={4}>
          {faqKeys.map((key, index) => (
            <FaqCard
              key={index}
              heading={faqData[key].heading}
              qAndAs={faqData[key].qAndA}
            ></FaqCard>
          ))}
        </Stack>
      </Container>
    </>
  )
}
