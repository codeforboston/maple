import { GetStaticProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { useTranslation } from "next-i18next"
import { Container } from "components/bootstrap"
import { HearingSearch } from "components/search"
import { createPage } from "components/page"
import { flags } from "components/featureFlags"

const HearingsPage = createPage({
  titleI18nKey: "navigation.browseHearings",
  Page: () => {
    const { t } = useTranslation("search")

    return (
      <Container fluid="md" className="mt-3">
        <h1>{t("browse_hearings")}</h1>
        <HearingSearch />
      </Container>
    )
  }
})

export default HearingsPage

export const getStaticProps: GetStaticProps = async ctx => {
  if (!flags().hearingsAndTranscriptions) return { notFound: true }

  const locale = ctx.locale ?? ctx.defaultLocale ?? "en"

  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "auth",
        "search",
        "common",
        "footer",
        "hearing"
      ]))
    }
  }
}
