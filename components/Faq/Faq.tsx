import { Container, Stack, Col } from "../bootstrap"
import { FaqQandA } from "./FaqQandA"
import { FaqCard } from "./FaqCard"
import styles from "./Faq.module.css"
import content from "./faqContent.json"
import { DropdownButton } from "../shared/DropdownButton/DropdownButton"
import { useMediaQuery } from "usehooks-ts"
import { stylingProps } from "../shared/DropdownButton/DropdownButton"

export const Faq = () => {
  const mdMobile = useMediaQuery("(max-width: 768px)")
  const xsMobile = useMediaQuery("(max-width: 418px)")

  const faqData: FaqData = content
  const faqKeys: string[] = Object.keys(faqData)
  const faqHeadings: string[] = faqKeys.map((key, index) => {
    return faqData[key].heading
  })

  interface FaqData {
    [key: string]: string | FaqDataCard | any
  }

  interface FaqDataCard {
    heading: string
    qAndA: { question: string; answer: string }[]
  }

  const header1 = "FAQ"
  const dropdownTitle = "All FAQ Topics"

  const styling: stylingProps = {
    width: { desktop: "418px", mobile: xsMobile ? "100%" : "418px" }
  }

  return (
    <Container fluid className={styles.faqLayout}>
      <Stack
        className={styles.faqHeader}
        direction={mdMobile ? "vertical" : "horizontal"}
        gap={mdMobile ? 0 : 4}
      >
        <h1>{header1}</h1>
        <Col xs={xsMobile ? 12 : !12}>
          <DropdownButton title={dropdownTitle} styling={styling}>
            {faqHeadings}
          </DropdownButton>
        </Col>
      </Stack>

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
  )
}
