import styled from "styled-components"
import { Card } from "../bootstrap"
import { FC, PropsWithChildren } from "react"

const StyledHeader = styled(Card.Header)`
  transform: translate(0);

  &:first-child {
    border-radius: 10px 10px 0 0;
  }

  @media (min-width: 48em) {
    width: max-content;
    margin-bottom: -1rem;
    transform: translate(-3rem, -40%);

    &:first-child {
      border-radius: 0 5rem 5rem 0;
    }
  }
`

const AboutPagesCard: FC<PropsWithChildren<{ title: string }>> = ({
  title,
  children
}) => {
  return (
    <Card className="m-5 rounded-3 bg-white">
      <StyledHeader
        as="h1"
        className="bg-secondary text-white overflow-hidden fs-sm-1 pt-2 pt-sm-3 pb-1 pb-sm-3 ps-4 ps-sm-5 pe-5"
      >
        {title}
      </StyledHeader>
      <Card.Body>{children}</Card.Body>
    </Card>
  )
}

export default AboutPagesCard
