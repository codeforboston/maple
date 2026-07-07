import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import { Col, Container, Row } from "components/bootstrap"
import { createPage } from "components/page"
import { createGetStaticTranslationProps } from "components/translations"

function LobbyingFirmDetail() {
  const { t } = useTranslation("lobbying")
  const { query } = useRouter()

  return (
    <Container>
      <Row className="mt-4 mb-3">
        <Col>
          <a href="/lobbying/firms" className="text-muted small">
            ← {t("titles.firms")}
          </a>
          <h1 className="mt-2">{query.registrantId}</h1>
          <p className="text-muted">{t("titles.firm")}</p>
        </Col>
      </Row>
    </Container>
  )
}

export default createPage({
  titleI18nKey: "titles.lobbying",
  Page: LobbyingFirmDetail
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "lobbying"
])

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" }
}
