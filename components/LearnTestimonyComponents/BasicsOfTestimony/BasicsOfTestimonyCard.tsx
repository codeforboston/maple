import styled from "styled-components"
import { Col, Image, Row } from "../../bootstrap"

export type BasicsOfTestimonyCardProps = {
  title: string
  index: number
  alt: string
  paragraph: string
  src: string
}

const TestimonyWordBubble = styled(Col)`
  width: 20rem;

  @media (max-width: 48em) {
    width: 50%;
    margin: 0 25%;
    transform: translate(0, 2rem);
  }

  img {
    transform: ${props =>
      props.$alignLeft ? "translate(2rem)" : "translate(-2rem)"};
  }
`

const BasicsOfTestimonyCard = ({
  title,
  index,
  alt,
  paragraph,
  src
}: BasicsOfTestimonyCardProps) => {
  return (
    <Row className="w-100 h-auto m-0 p-0 d-flex flex-row flex-wrap py-md-3 px-md-5 my-md-5 mx-md-0">
      <TestimonyWordBubble
        $alignLeft={index % 2 == 0}
        className="d-flex align-items-center"
        md={6}
        lg={{ order: index % 2 == 0 ? 0 : 5 }}
      >
        <Image fluid alt={alt} src={src} />
      </TestimonyWordBubble>
      <Col
        className="d-flex flex-column justify-content-center bg-white rounded-3 p-5 tracking-tighter lh-base"
        lg={{ order: 3 }}
      >
        <h4 className="pt-0 pt-md-3 mb-3 fw-bold">{title}</h4>
        <p className="fs-4">{paragraph}</p>
      </Col>
    </Row>
  )
}

export default BasicsOfTestimonyCard
