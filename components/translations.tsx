import { GetStaticProps, GetStaticPropsResult } from "next"
import { SSRConfig } from "next-i18next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

export function createGetStaticTranslationProps(
  sources: string[]
): GetStaticProps {
  return async context => {
    const locale = context.locale ?? context.defaultLocale ?? "en"
    return {
      props: {
        ...(await serverSideTranslations(locale, sources))
      }
    }
  }
}