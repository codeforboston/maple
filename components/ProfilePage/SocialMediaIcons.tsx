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
            <Image alt="twitter" src="/twitter.svg" />
          </External>
        </Col>
      )}

      {linkedIn && (
        <Col>
          <External plain href={`${linkedIn}`}>
            <Image alt="linkedIn" src="/linkedin.svg" />
          </External>
        </Col>
      )}

      {instagram && (
        <Col>
          <External plain href={`https://www.instagram.com/${instagram}`}>
            <Image alt="instagram" src="/instagram.svg" />
          </External>
        </Col>
      )}

      {fb && (
        <Col>
          <External plain href={`https://www.facebook.com/${fb}`}>
            <Image alt="facebook" src="/facebook.svg" />
          </External>
        </Col>
      )}
    </Row>
  </div>
)
