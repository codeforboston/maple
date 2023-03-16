import { Row, Col, Image } from "react-bootstrap"
import { External } from "components/links"

export const Socials = ({
    twit: twitter,
    linkedIn
  }: {
    twit?: string
    linkedIn?: string
  }) => (
    <Row className={`d-flex`}>
      <Col className={`d-flex flex-grow-1 justify-content-between`}>
        {twitter && (
          <External plain href={`https://www.twitter.com/${twitter}`}>
            <Image alt="twitter" src="/twitter.svg" />
          </External>
        )}
      </Col>
      <Col>
        {linkedIn && (
          <External plain href={`https://www.linkedin.com/in/${linkedIn}`}>
            <Image alt="linkedIn" src="/linkedin.svg" />
          </External>
        )}
      </Col>
    </Row>
  )
  