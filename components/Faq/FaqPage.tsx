import styled from "styled-components"
import { Container, Stack } from "../bootstrap"
import { FaqCard } from "./FaqCard"
import content from "./faqContent.json"

export const FaqPage = () => {
  const faqData: FaqData = content
  const faqKeys: string[] = Object.keys(faqData)

  interface FaqData {
    [key: string]: string | FaqDataCard | any
  }

  interface FaqDataCard {
    heading: string
    qAndA: { question: string; answer: string }[]
  }

  const FaqH1 = styled.h1`
    margin: 1.5rem 0rem 1.5rem 2rem;

    @media only screen and (max-width: 600px) {
      margin: 1rem 0rem 1rem 0rem;
    }
  `

  return (
    <>
      <Container fluid className={`mb-5`}>
        <FaqH1>FAQ</FaqH1>
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
