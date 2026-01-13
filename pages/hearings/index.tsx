import { GetStaticProps } from "next"
import { useTranslation } from "next-i18next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

import { Container } from "components/bootstrap"
import { flags } from "components/featureFlags"
import { createPage } from "components/page"
import { HearingSearch } from "components/search"

const HearingsPage = createPage({
  titleI18nKey: "navigation.browseHearings",
  Page: () => {
    const { t } = useTranslation("common")

    return (
      <Container fluid="md" className="mt-3">
        <h1>{t("navigation.browseHearings")}</h1>
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
        "common",
        "footer",
        "hearing",
        "search"
      ]))
    }
  }
}
