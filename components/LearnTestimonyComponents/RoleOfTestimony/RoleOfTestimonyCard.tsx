import { Col, Image, Row } from "../../bootstrap"
import {
  TestimonyCard,
  TestimonyCardContent,
  TestimonyCardTitle
} from "../StyledTestimonyComponents"
import styled from "styled-components"

export type RoleOfTestimonyCardProps = {
  title: string
  index: number
  alt: string
  paragraph: string
  src: string
}

const StyledImageCol = styled(Col)`
  width: auto;
  margin: 0 3rem;
  @media (max-width: 48em) {
    margin: auto;
  }
`

const StyledImage = styled(Image)`
  height: 10rem;
`

const ContentCol = styled(Col)`
  display: flex;
  flex-direction: column;
  justify-content: center;

  &.textLeft {
    padding-left: 3rem;
    @media (max-width: 48em) {
      padding-left: 1rem;
    }
  }
`

const RoleOfTestimonyCard = ({
  title,
  index,
  alt,
  paragraph,
  src
}: RoleOfTestimonyCardProps) => {
  return (
    <TestimonyCard className={`bg-white rounded`}>
      <Row className="my-auto">
        <StyledImageCol
          sm={{ span: 12, order: 0 }}
          md={{ order: index % 2 == 0 ? 0 : 5 }}
        >
          <StyledImage fluid src={src} alt={alt} />
        </StyledImageCol>
        <ContentCol
          className={index % 2 == 0 ? "" : "textLeft"}
          sm={{ span: 12, order: 1 }}
          md={{ span: 6, order: 3 }}
        >
          <TestimonyCardTitle>{title}</TestimonyCardTitle>
          <TestimonyCardContent>{paragraph}</TestimonyCardContent>
        </ContentCol>
      </Row>
    </TestimonyCard>
  )
}

export default RoleOfTestimonyCard
