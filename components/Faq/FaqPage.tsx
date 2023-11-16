import { Container, Stack, Col } from "../bootstrap"
import { FaqQandA } from "./FaqQandA"
import { FaqCard } from "./FaqCard"
import styles from "./Faq.module.css"
import { faqContentCards } from "./faqContent"
import { DropdownFilter } from "../shared/Dropdown/DropdownFilter"
import { useMediaQuery } from "usehooks-ts"
import { stylingProps } from "../shared/Dropdown/DropdownFilter"
import { useState } from "react"

export const FaqPage = () => {
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
  const [selected, setSelected] = useState(dropdownTitle)

  return (
    <Container fluid className={styles.faqLayout}>
      <Stack
        className={styles.faqHeader}
        direction={mdMobile ? "vertical" : "horizontal"}
        gap={mdMobile ? 0 : 4}
      >
        <h1>{header1}</h1>
        <Col xs={xsMobile ? 12 : !12}>
          <DropdownFilter
            key={dropdownTitle}
            title={dropdownTitle}
            styling={styling}
            variant="secondary"
            setFilter={(eventKey: string) => {
              setSelected(eventKey)
            }}
          >
            {faqCardHeadings}
          </DropdownFilter>
        </Col>
      </Stack>

      <Stack direction="vertical" gap={4}>
        {faqContentCards
          .filter(
            card => selected === dropdownTitle || selected === card.heading
          )
          .map(filtered => (
            <FaqCard
              key={filtered.id}
              faqId={filtered.id}
              heading={filtered.heading}
              qAndAs={filtered.qAndA}
            ></FaqCard>
          ))}
      </Stack>
    </Container>
  )
}
