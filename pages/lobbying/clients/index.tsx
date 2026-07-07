import { useTranslation } from "next-i18next"
import { Col, Container, Row } from "components/bootstrap"
import { createPage } from "components/page"
import { createGetStaticTranslationProps } from "components/translations"

function LobbyingClients() {
  const { t } = useTranslation("lobbying")

  return (
    <Container>
      <Row className="mt-4 mb-3">
        <Col>
          <a href="/lobbying" className="text-muted small">
            ← {t("titles.overview")}
          </a>
          <h1 className="mt-2">{t("titles.clients")}</h1>
          <p className="text-muted">{t("subtitle")}</p>
        </Col>
      </Row>
    </Container>
  )
}

export default createPage({
  titleI18nKey: "titles.lobbying",
  Page: LobbyingClients
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "lobbying"
])
