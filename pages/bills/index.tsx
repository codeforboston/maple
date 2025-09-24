import { useTranslation } from "next-i18next"
import { Container } from "components/bootstrap"
import { createPage } from "components/page"
import { BillSearch } from "components/search"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  titleI18nKey: "navigation.browseBills",
  Page: () => {
    const { t } = useTranslation("search")

    return (
      <Container fluid="md" className="mt-3">
        <h1>{t("browse_bills")}</h1>
        <BillSearch />
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
  "billSearch"
])
