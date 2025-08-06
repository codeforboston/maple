import { Row, Col } from "../bootstrap"
import Image from "react-bootstrap/Image"
import styled from "styled-components"
import { useTranslation } from "next-i18next"

const StyledImage = styled(Image)`
  width: 12.5rem;
  /* bootstrap: medium > 768px */
  @media (max-width: 48em) {
    display: flex;
    margin-left: auto;
    margin-right: auto;
  }

  /* bootstrap: small > 576px */
  @media (max-width: 36em) {
    width: 10rem;
  }

  /* bootstrap: xs < 576px
   this break at 464px */
  @media (max-width: 26em) {
    width: 8rem;
  }
`

const WritingContent = () => (
  <Row className="align-items-center">
    <Col xs={12} md={8} lg={{ span: 7, offset: 1 }}>
      <p>
        {useTranslation("learnComponents").t(
          "communicating.testifyInWriting.content"
        )}
      </p>
    </Col>
    <Col md={4} lg={3}>
      <StyledImage
        className={`float-md-end`}
        fluid
        src="/computer-text-blob.svg"
        alt=""
      />
    </Col>
  </Row>
)

const OralContent = () => (
  <Row className="align-items-center">
    <Col
      xs={{ span: 12, order: 2 }}
      md={{ span: 4, order: 0 }}
      lg={{ span: 3, order: 0, offset: 1 }}
    >
      <StyledImage fluid src="/mic-with-testify.svg" alt="" />
    </Col>
    <Col
      xs={{ span: 12, order: 1 }}
      md={{ span: 8, order: 1 }}
      lg={{ span: 7, order: 1 }}
    >
      <p>
        {useTranslation("learnComponents").t(
          "communicating.testifyOrally.content"
        )}
      </p>
    </Col>
  </Row>
)

const WriteOrCallContent = () => (
  <Row className="align-items-center">
    <Col xs={12} md={8} lg={{ span: 7, offset: 1 }}>
      <p>
        {useTranslation("learnComponents").t(
          "communicating.writeOrCall.content"
        )}
      </p>
    </Col>
    <Col md={4} lg={3}>
      <StyledImage
        className={`float-md-end`}
        fluid
        src="/open-envelope.svg"
        alt=""
      />
    </Col>
  </Row>
)

export { WritingContent, OralContent, WriteOrCallContent }
