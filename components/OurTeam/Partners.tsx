import { useTranslation, Trans } from "next-i18next"
import AboutPagesCard from "../AboutPagesCard/AboutPagesCard"
import { Col, Container, Row } from "../bootstrap"
import { PageTitle, PageDescr } from "../shared/CommonComponents"
import Image from "react-bootstrap/Image"

const LocalizedContent = (props: {
  i18nKey: string
  linkClassName?: string
}) => (
  <Trans
    i18nKey={props.i18nKey}
    ns="partners"
    components={{
      a: (
        <a
          href="value-overridden-by-partners-json"
          target="_blank"
          rel="noreferrer"
          className={props.linkClassName}
        />
      )
    }}
  />
)

const PartnerContentCard = ({ src, org }: { src: string; org: string }) => {
  const { t } = useTranslation("partners")
  const orgTitle = t(`${org}.title`)
  return (
    <Row>
      <Col>
        <AboutPagesCard title={orgTitle}>
          <Row className="mb-3">
            <Col className="text-center align-self-center" md={3}>
              <Image fluid src={src} alt={t("logo", { org: orgTitle })} />
            </Col>
            <Col className="align-self-center" md={9}>
              <p className="lh-sm tracking-wide fs-5 pt-4 pt-md-0">
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
    <PageTitle>{useTranslation("partners").t("title")}</PageTitle>
    <PageDescr className="py-3">
      <LocalizedContent i18nKey="desc" linkClassName="text-decoration-none" />
    </PageDescr>
    <PartnerContentCard
      src="/northeastern_school_of_law_logo.svg"
      org="nulawlab"
    />
    <PartnerContentCard src="/codeforbostonicon.png" org="codeforboston" />
    <PartnerContentCard src="/pid.png" org="pid" />
  </Container>
)
