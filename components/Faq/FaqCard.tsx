import styled from "styled-components"
import { FaqQandAButton } from "./FaqQandAButton"

type faqCardProps = {
  heading: string
  qAndAs: { disabled?: boolean; question: string; answer: string }[]
}

export const FaqCard = ({ heading, qAndAs }: faqCardProps) => {
  const FaqCardContainer = styled.div`
    margin: 0 2rem;
    padding: 2rem 2.5rem;

    @media only screen and (max-width: 600px) {
      margin: 0rem;
      padding: 2rem 1.5rem;
    }
  `

  return (
    <FaqCardContainer className="bg-white rounded">
      <h6 className="fw-bold mb-4 text-secondary">{heading ?? ""}</h6>
      <hr className="mb-4 opacity-100" />
      {qAndAs.map(
        (key, index) =>
          typeof key.disabled === "undefined" && (
            <div className={`my-3`} key={index}>
              <FaqQandAButton
                key={index}
                question={key.question}
                answer={key.answer}
              ></FaqQandAButton>
            </div>
          )
      )}
    </FaqCardContainer>
  )
}
