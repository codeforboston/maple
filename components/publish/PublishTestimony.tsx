import styled from "styled-components"
import { positionLabels } from "./content"
import { usePublishState } from "./redux"
import { StepHeader } from "./StepHeader"

const maxLength = 1000

export const PublishTestimony = styled(({ ...rest }) => {
  const { position, content } = usePublishState()
  const snippet = clampString(content!, maxLength)

  return (
    <div {...rest}>
      <StepHeader>Confirm Your Choices</StepHeader>
      <div className="testimony-container mt-4">
        <div className="title">Your Testimony</div>
        <p>
          You <b>{positionLabels[position!]}</b> this bill
        </p>
        <p>“{snippet}”</p>
      </div>
    </div>
  )
})`
  p {
    margin-bottom: 1rem;
    white-space: pre-wrap;
  }

  @media (min-width: 768px) {
    .testimony-container {
      padding: 3rem 4rem 3rem 4rem !important;
    }
  }

  .testimony-container {
    color: white;
    padding: 1rem;
    background-color: var(--bs-blue);
    border-radius: 1rem;
  }

  .title {
    font-weight: bold;
    font-size: 1.25rem;
    text-align: center;
    margin-bottom: 1rem;
  }
`

const clampString = (s: string, maxLength: number) => {
  const words = s.split(" ")
  let length = 0
  for (let i = 0; i < words.length; i++) {
    length += words[i].length + (length > 0 ? 1 : 0)
    if (length > maxLength) {
      return words.slice(0, i).join(" ") + "…"
    }
  }
  return s
}
