import { Container } from "components/bootstrap"
import { createPage } from "components/page"
import { TestimonySearch } from "components/search/testimony/TestimonySearch"
import { createGetStaticTranslationProps } from "components/translations"
import { useTranslation } from "next-i18next"

export default createPage({
  titleI18nKey: "navigation.browseTestimony",
  Page: () => {
    return (
      <Container fluid="md" className="mt-3">
        <h1 className="mb-3">
          {useTranslation("common").t("navigation.browseTestimony")}
        </h1>
        <TestimonySearch />
      </Container>
    )
  }
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "search",
  "common",
  "footer",
  "testimony",
  "profile"
])
