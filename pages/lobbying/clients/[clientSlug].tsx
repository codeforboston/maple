import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import { Col, Container, Row } from "components/bootstrap"
import { createPage } from "components/page"
import { createGetStaticTranslationProps } from "components/translations"

function LobbyingClientDetail() {
  const { t } = useTranslation("lobbying")
  const { query } = useRouter()

  return (
    <Container>
      <Row className="mt-4 mb-3">
        <Col>
          <a href="/lobbying/clients" className="text-muted small">
            ← {t("titles.clients")}
          </a>
          <h1 className="mt-2">{query.clientSlug}</h1>
          <p className="text-muted">{t("titles.client")}</p>
        </Col>
      </Row>
    </Container>
  )
}

export default createPage({
  titleI18nKey: "titles.lobbying",
  Page: LobbyingClientDetail
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
