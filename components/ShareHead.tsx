import { useTranslation } from "next-i18next"
import Head from "next/head"
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
 * Title, description and Open Graph tags for link previews.
 *
 * `Layout` renders nothing until the page is running in the browser, so tags
 * it sets never reach the server-rendered HTML that link-preview crawlers
 * read. `applyLayout` renders this outside `Layout`, so these tags are in that
 * HTML.
 */
export const ShareHead = ({ share }: { share: ShareMeta }) => {
  const { t } = useTranslation("common")
  const title = `${t(share.titleI18nKey)} | ${t("maple_abbr")}: ${t(
    "maple_fullName"
  )}`
  const description = t(share.descriptionI18nKey)
  const url = `${SITE_URL}${share.path}`
  const image = `${SITE_URL}${share.image}`
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={t("maple_abbr")} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="627" />
      <meta name="twitter:card" content="summary_large_image" />
      <link rel="canonical" href={url} />
    </Head>
  )
}
