import { Container, Stack, Col } from "../bootstrap"
import { FaqQandA } from "./FaqQandA"
import { FaqCard } from "./FaqCard"
import styles from "./Faq.module.css"
import { faqContentCards } from "./faqContent"
import { DropdownButton } from "../shared/DropdownButton/DropdownButton"
import { useMediaQuery } from "usehooks-ts"
import { stylingProps } from "../shared/DropdownButton/DropdownButton"

export const Faq = () => {
  const mdMobile = useMediaQuery("(max-width: 768px)")
  const xsMobile = useMediaQuery("(max-width: 418px)")

  const faqCardHeadings: Array<string> = faqContentCards.map(key => {
    return key.heading
  })

  interface Headings {
    id: number
    itemName: string
  }

  interface FaqContentCards {
    [key: string]: string | FaqContentCard | any
  }

  interface FaqContentCard {
    id: number
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
          <DropdownButton
            key={dropdownTitle}
            title={dropdownTitle}
            styling={styling}
            variant="secondary"
          >
            {faqCardHeadings}
          </DropdownButton>
        </Col>
      </Stack>

      <Stack direction="vertical" gap={4}>
        {faqContentCards.map(card => (
          <FaqCard
            key={card.id}
            faqId={card.id}
            heading={card.heading}
            qAndAs={card.qAndA}
          ></FaqCard>
        ))}
      </Stack>
    </Container>
  )
}
