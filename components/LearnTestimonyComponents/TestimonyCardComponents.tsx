import styled from "styled-components";
import { Card, Col, Container, Image, Row } from "../bootstrap";

export type TestimonyCardContent = {
    title: string,
    paragraphs: string[],
    src: string,
    alt: string
  }

export const TestimonyCardList = ({ contents, shouldAlternateImages = false }: { contents: TestimonyCardContent[], shouldAlternateImages: boolean}) => {
    return (
        contents.map((value, index) => (
            <TestimonyCard 
                key={value.title}
                content={value}
                shouldAlternateImage={shouldAlternateImages && index % 2 !== 0}
            />
            )
        )
    )
}

export type TestimonyCardProps = {
    content: TestimonyCardContent,
    shouldAlternateImage: boolean
}

const StyledCard = styled(Card)`
    margin: 8rem 5rem;
    padding-top: 0;
    padding-bottom: 0;
    border-radius: 12px;
    background: #ffffff;
    @media (max-width: 48em) {
        margin: 8rem 3rem;
    }
`
const StyledHeader = styled(Card.Header)`
    background-color: var(--bs-blue);
    width: max-content;
    padding-top: 0;
    padding-bottom: 0;
    padding-right: 4rem;
    padding-left: 2rem;
    height: 5rem;
    transform: translate(-3rem, -40%);
    overflow: hidden;
    line-height: 5rem;
    font-weight: 900;
    &:first-child {
        border-radius: 0 5rem 5rem 0;
    }
    @media (max-width: 48em) {
        font-size: 1.5rem;
        padding-right: 3rem;
        padding-left: 1.5rem;
        height: 4rem;
        line-height: 4rem;
        transform: translate(-2rem, -40%);
    }
    @media (max-width: 36em) {
        font-size: 1.125rem;
        padding-right: 3rem;
        padding-left: 1.5rem;
        height: 2.5rem;
        line-height: 2.5rem;
        transform: translate(-1.5rem, -40%);
    }
`
const TestimonyCard = ({ content, shouldAlternateImage }: TestimonyCardProps) => {
    return (
      <StyledCard>
        <StyledHeader
            as="h1"
            className={`text-center text-white`}
        >
            {content.title}
        </StyledHeader>
        <TestimonyCardContent content={content} shouldAlternateImage={shouldAlternateImage} />
      </StyledCard>
    )
}

const StyledCol = styled(Col)`
    padding-right: 4rem;
    padding-left: 2rem;
    display: flex;
    flex-direction: row;
    justify-content: center;
    @media (max-width: 29em) {
        padding-right: 2rem;
        padding-left: 1rem;
    }
`
const StyledImage = styled(Image)`
    @media (max-width: 36em) {
        width: 12rem;
    }
    @media (max-width: 29em) {
        width: 10rem;
    }
`
const StyledTextWrapper = styled.div`
    flex-grow: 0;
    font-family: "Nunito";
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    letter-spacing: -0.63px;
    text-align: left;
    color: #000;
    @media (max-width: 62em) {
        padding-top: 1.5rem;
    }
    @media (max-width: 36em) {
        padding-top: 1rem;
    }
`

const TestimonyCardContent = ({ content, shouldAlternateImage }: TestimonyCardProps) => {
    return (
        <Card.Body>
            <Container fluid>
                <Row className="my-auto align-items-center flex-row">
                    <StyledCol
                        className="text-center align-self-center justify-content-xs-center"
                        md={12}
                        lg={{ span: 4, order: shouldAlternateImage ? 4 : 1 }}
                    >
                        <div>
                            <StyledImage fluid src={`/${content.src}`} alt={content.alt} />
                        </div>
                    </StyledCol>
                    <StyledCol 
                        className="text-center align-self-center justify-content-xs-center"
                        md={12}
                        lg={{ span: 8, order: 2}}
                    >
                        <StyledTextWrapper>
                            {
                                content.paragraphs.map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))
                            }
                        </StyledTextWrapper>
                    </StyledCol>
                </Row>
            </Container>
        </Card.Body>
    )
}