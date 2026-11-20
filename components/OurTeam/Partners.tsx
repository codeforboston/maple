import { useTranslation, Trans } from "next-i18next"
import AboutPagesCard from "../AboutPagesCard/AboutPagesCard"
import { Col, Container, Row } from "../bootstrap"
import { PageDescr } from "../shared/CommonComponents"
import Image from "react-bootstrap/Image"

export const LocalizedContent = (props: {
  i18nKey: string
  linkClassName?: string
}) => (
  <Trans
    i18nKey={props.i18nKey}
    ns="partners"
    components={{
      a: (
        <a
          // href values are overridden by partners.json
          target="_blank"
          rel="noreferrer"
          className={props.linkClassName}
        />
      )
    }}
  />
)

// The logo is optional: without one, the description takes the full width.
const PartnerContentCard = ({ src, org }: { src?: string; org: string }) => {
  const { t } = useTranslation("partners")
  const orgTitle = t(`${org}.title`)
  return (
    <Row>
      <Col>
        <AboutPagesCard title={orgTitle}>
          <Row className="mb-3">
            {src ? (
              <Col className="text-center align-self-center" md={3}>
                <Image fluid src={src} alt={t("logo", { org: orgTitle })} />
              </Col>
            ) : null}
            <Col className="align-self-center" md={src ? 9 : 12}>
              <p
                className={`lh-sm tracking-wide fs-6 ${
                  src ? "pt-4 pt-md-0" : ""
                }`}
              >
                <LocalizedContent i18nKey={`${org}.content`} />
              </p>
            </Col>
          </Row>
        </AboutPagesCard>
      </Col>
    </Row>
  )
}

export const OurPartners = () => (
  <Container>
    <PageDescr className="py-3">
      <LocalizedContent i18nKey="desc" linkClassName="text-decoration-none" />
    </PageDescr>
    <PartnerContentCard src="/pid.png" org="pid" />
    <PartnerContentCard src="/codeforbostonicon.png" org="codeforboston" />
    <PartnerContentCard
      src="/northeastern_school_of_law_logo.png"
      org="nulawlab"
    />
    <PartnerContentCard org="calmatters" />
    <PartnerContentCard org="hypha" />
  </Container>
)
