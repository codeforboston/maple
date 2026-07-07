import { useTranslation } from "next-i18next"
import { Col, Container, Row } from "components/bootstrap"
import { createPage } from "components/page"
import { createGetStaticTranslationProps } from "components/translations"

function LobbyingOverview() {
  const { t } = useTranslation("lobbying")

  return (
    <Container>
      <Row className="mt-4 mb-3">
        <Col>
          <h1>{t("titles.overview")}</h1>
          <p className="text-muted">{t("subtitle")}</p>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">{t("sections.bills")}</h5>
              <a href="/lobbying/bills" className="btn btn-primary btn-sm mt-2">
                {t("titles.bills")} →
              </a>
            </div>
          </div>
        </Col>
        <Col md={4} className="mb-3">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">{t("sections.clients")}</h5>
              <a
                href="/lobbying/clients"
                className="btn btn-primary btn-sm mt-2"
              >
                {t("titles.clients")} →
              </a>
            </div>
          </div>
        </Col>
        <Col md={4} className="mb-3">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">{t("sections.firms")}</h5>
              <a href="/lobbying/firms" className="btn btn-primary btn-sm mt-2">
                {t("titles.firms")} →
              </a>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default createPage({
  titleI18nKey: "titles.lobbying",
  Page: LobbyingOverview
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "lobbying"
])
