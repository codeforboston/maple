import { Row, Col } from "../bootstrap"
import Image from "react-bootstrap/Image"
import styled from "styled-components"

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
        You can submit your thoughts on a bill to the Committee hearing it
        before the date of their public hearing. This website, the MAPLE
        platform, focuses on this mechanism.
      </p>
    </Col>
    <Col md={4} lg={3}>
      <StyledImage
        className={`float-md-end`}
        fluid
        src="/computer-text-blob.svg"
        alt="computer display with lines representing text"
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
      <StyledImage
        fluid
        src="/mic-with-testify.svg"
        alt="microphone next to a sheet of paper"
      />
    </Col>
    <Col
      xs={{ span: 12, order: 1 }}
      md={{ span: 8, order: 1 }}
      lg={{ span: 7, order: 1 }}
    >
      <p>
        You can attend a public hearing for a bill of interest to you and sign
        up for a slot to speak before the Committee.
      </p>
    </Col>
  </Row>
)

const WriteOrCallContent = () => (
  <Row className="align-items-center">
    <Col xs={12} md={8} lg={{ span: 7, offset: 1 }}>
      <p>
        You can contact your legislators any time by looking up their contact
        information on the MA Legislature website. Your voice will probably
        carry the most weight with the House and Senate representatives of your
        own district, but you are free to contact Committee Chairs or any other
        member of the legislature with your opinions. You could request a
        meeting in person.
      </p>
    </Col>
    <Col md={4} lg={3}>
      <StyledImage
        className={`float-md-end`}
        fluid
        src="/open-envelope.svg"
        alt="envelope with letter sticking out"
      />
    </Col>
  </Row>
)

export { WritingContent, OralContent, WriteOrCallContent }
