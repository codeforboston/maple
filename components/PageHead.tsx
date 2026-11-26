import { TFunction, useTranslation } from "next-i18next"
import Head from "next/head"
import { useRouter } from "next/router"
import { SITE_URL } from "./common"

/**
 * What a link preview (LinkedIn, Bluesky, Slack, …) shows for a page.
 *
 * @property {string} titleI18nKey - Key in `common.json`, as for `titleI18nKey`.
 * @property {string} descriptionI18nKey - Key with its namespace, e.g.
 * "newsletter:share_description". The page must load that namespace.
 * @property {string} path - The page's path on the site, e.g. "/newsletter".
 * @property {string} image - Path of an image in `public/`, 1200×627 pixels
 * (the size LinkedIn shows full-width; the tags below state that size).
 */
export type ShareMeta = {
  titleI18nKey: string
  descriptionI18nKey: string
  path: string
  image: string
}

/**
 * A title and description worked out from a page's props, for pages such as
 * a bill's whose title depends on what they show. Either one, when given,
 * replaces the one from `titleI18nKey`, `share` or the site's default.
 */
export type HeadMeta = { title?: string; description?: string }

export type HeadFromProps<P> = (props: P, t: TFunction) => HeadMeta

/**
 * The page's title, description, canonical URL and link-preview tags.
 *
 * `Layout` renders nothing until the page is running in the browser, so tags
 * it sets never reach the server-rendered HTML that search engines and
 * link-preview crawlers read. `applyLayout` renders this outside `Layout`, so
 * these tags are in that HTML, on every page.
 */
export const PageHead = <P,>({
  titleI18nKey,
  share,
  head,
  pageProps
}: {
  titleI18nKey?: string
  share?: ShareMeta
  head?: HeadFromProps<P>
  pageProps: P
}) => {
  const { t } = useTranslation("common")
  const { asPath, isFallback } = useRouter()
  // A fallback page renders before its props arrive.
  const meta = head && !isFallback ? head(pageProps, t) : undefined

  const site = `${t("maple_abbr")}: ${t("maple_fullName")}`
  const name =
    meta?.title ??
    (share ? t(share.titleI18nKey) : titleI18nKey && t(titleI18nKey))
  const title = name ? `${name} | ${site}` : site
  const description =
    meta?.description ??
    (share ? t(share.descriptionI18nKey) : t("short_description"))
  // The path without its query or fragment, so filtered and paged views of a
  // list point search engines at the list itself.
  const path = share?.path ?? asPath.split(/[?#]/)[0]
  const url = `${SITE_URL}${path}`

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="icon" href="/favicon.ico" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={t("maple_abbr")} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {/* A fallback page's path is still its route pattern, not a URL. */}
      {!isFallback && <meta property="og:url" content={url} />}
      {!isFallback && <link rel="canonical" href={url} />}
      {share && (
        <meta property="og:image" content={`${SITE_URL}${share.image}`} />
      )}
      {share && <meta property="og:image:width" content="1200" />}
      {share && <meta property="og:image:height" content="627" />}
      <meta
        name="twitter:card"
        content={share ? "summary_large_image" : "summary"}
      />
    </Head>
  )
}
