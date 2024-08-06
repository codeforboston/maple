import styled from "styled-components"
import { Card, Col, Container, Image, Row } from "../bootstrap"

export type TestimonyCardContent = {
  title: string
  paragraphs: string[]
  src: string
  alt: string
}

export const TestimonyCardList = ({
  contents,
  shouldAlternateImages = false
}: {
  contents: TestimonyCardContent[]
  shouldAlternateImages: boolean
}) => {
  return (
    <div>
      {contents.map((value, index) => (
        <TestimonyCard
          key={value.title}
          content={value}
          shouldAlternateImage={shouldAlternateImages && index % 2 !== 0}
        />
      ))}
    </div>
  )
}

export type TestimonyCardProps = {
  content: TestimonyCardContent
  shouldAlternateImage: boolean
}

const StyledCard = styled(Card)`
  margin: 8rem 5rem;

  @media (max-width: 48em) {
    margin: 8rem 3rem;
  }
`
const StyledHeader = styled(Card.Header)`
  width: max-content;
  transform: translate(-3rem, -40%);

  &:first-child {
    border-radius: 0 5rem 5rem 0;
  }
  @media (max-width: 48em) {
    transform: translate(-2rem, -40%);
  }
  @media (max-width: 36em) {
    transform: translate(-1.5rem, -40%);
  }
`
const TestimonyCard = ({
  content,
  shouldAlternateImage
}: TestimonyCardProps) => {
  return (
    <StyledCard className="py-0 rounded-3 bg-white">
      <StyledHeader
        as="h1"
        className="d-flex align-items-center py-3 ps-4 pe-5 bg-secondary text-center text-white fw-bolder overflow-hidden"
      >
        {content.title}
      </StyledHeader>
      <TestimonyCardContent
        content={content}
        shouldAlternateImage={shouldAlternateImage}
      />
    </StyledCard>
  )
}

const StyledImage = styled(Image)`
  @media (max-width: 36em) {
    width: 12rem;
  }
  @media (max-width: 29em) {
    width: 10rem;
  }
`

const TestimonyCardContent = ({
  content,
  shouldAlternateImage
}: TestimonyCardProps) => {
  return (
    <Card.Body>
      <Container fluid>
        <Row className="my-auto align-items-center flex-row">
          <Col
            className="d-flex flex-row pl-3 pr-4 pl-s-4 pr-s-5 text-center align-self-center justify-content-center"
            md={12}
            lg={{ span: 4, order: shouldAlternateImage ? 4 : 1 }}
          >
            <div>
              <StyledImage fluid src={`/${content.src}`} alt={content.alt} />
            </div>
          </Col>
          <Col
            className="d-flex flex-column pl-3 pr-4 pl-sm-4 pr-sm-5 pt-3 pt-sm-4 pt-md-0 text-center align-self-center justify-content-center tracking-tighter"
            md={12}
            lg={{ span: 8, order: 2 }}
          >
            {content.paragraphs.map((paragraph, index) => (
              <p className="text-start" key={index}>
                {paragraph}
              </p>
            ))}
          </Col>
        </Row>
      </Container>
    </Card.Body>
  )
}
