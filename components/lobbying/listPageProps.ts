import { GetStaticProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

// The lobbying list pages are prerendered and regenerated at most once a day
// (the scraper updates the data weekly), instead of every visitor reading
// thousands of summary docs from Firestore.
export const LIST_REVALIDATE_SECONDS = 24 * 60 * 60

/** getStaticProps for a lobbying list page: its data plus translations. */
export function createLobbyingListProps<P extends Record<string, unknown>>(
  load: () => Promise<P>
): GetStaticProps<P> {
  return async context => {
    const locale = context.locale ?? context.defaultLocale ?? "en"
    const [data, translations] = await Promise.all([
      load(),
      serverSideTranslations(locale, ["auth", "common", "footer", "lobbying"])
    ])
    return {
      props: { ...data, ...translations },
      revalidate: LIST_REVALIDATE_SECONDS
    }
  }
}
