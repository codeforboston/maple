import { Row, Col, Image } from "react-bootstrap"
import { External } from "components/links"

export const SocialMediaIcons = ({
  twitter,
  linkedIn,
  instagram,
  fb
}: {
  twitter?: string
  instagram?: string
  fb?: string
  linkedIn?: string
}) => (
  <div>
    <Row xs="auto">
      {twitter && (
        <Col>
          <External plain href={`https://www.twitter.com/${twitter}`}>
            <Image alt="Visit the organization's Twitter Page." src="/twitter.svg" />
          </External>
        </Col>
      )}

      {linkedIn && (
        <Col>
          <External plain href={`${linkedIn}`}>
            <Image alt="Visit the organization's LinkedIn Page." src="/linkedin.svg" />
          </External>
        </Col>
      )}

      {instagram && (
        <Col>
          <External plain href={`https://www.instagram.com/${instagram}`}>
            <Image alt="Visit the organization's Instagram Page." src="/instagram.svg" />
          </External>
        </Col>
      )}

      {fb && (
        <Col>
          <External plain href={`https://www.facebook.com/${fb}`}>
            <Image alt="Visit the organization's Facebook Page." src="/facebook.svg" />
          </External>
        </Col>
      )}
    </Row>
  </div>
)
