import { Row, Col, Image } from "react-bootstrap"
import { External } from "components/links"
import { useTranslation } from "next-i18next"

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
}) => {
  const { t } = useTranslation("common")

  return (
    <div>
      <Row xs="auto">
        {twitter && (
          <Col>
            <External plain href={`https://www.twitter.com/${twitter}`}>
              <Image alt={t("socials.twitter")} src="/twitter.svg" />
            </External>
          </Col>
        )}

        {linkedIn && (
          <Col>
            <External plain href={`${linkedIn}`}>
              <Image alt={t("socials.linkedin")} src="/linkedin.svg" />
            </External>
          </Col>
        )}

        {instagram && (
          <Col>
            <External plain href={`https://www.instagram.com/${instagram}`}>
              <Image alt={t("socials.instagram")} src="/instagram.svg" />
            </External>
          </Col>
        )}

        {fb && (
          <Col>
            <External plain href={`https://www.facebook.com/${fb}`}>
              <Image alt={t("socials.facebook")} src="/facebook.svg" />
            </External>
          </Col>
        )}
      </Row>
    </div>
  )
}
