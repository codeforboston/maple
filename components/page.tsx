import { NextPage } from "next"
import { AppProps } from "next/app"
import { ReactElement, ReactNode } from "react"
import { Layout } from "./layout"
import { HeadFromProps, PageHead, ShareMeta } from "./PageHead"

export type ApplyLayout = (page: ReactElement) => ReactNode

/**
 * What a page tells the app around it.
 *
 * @property {string} [titleI18nKey] - The internationalization key for the
 * title. This key must be defined in the `common.json` namespace.
 */
export type PageOptions<P> = {
  titleI18nKey?: string
  /** Link-preview tags, for pages meant to be shared. */
  share?: ShareMeta
  /** A title and description from the page's props, for pages whose title
   * depends on what they show, such as a bill's. */
  head?: HeadFromProps<P>
}

export type AppPage<P> = NextPage<P> & PageOptions<P>

export type AppPropsWithLayout = AppProps & {
  Component: AppPage<any>
}

export function applyLayout({ Component, pageProps }: AppPropsWithLayout) {
  const page = <Component {...pageProps} />
  return (
    <>
      <PageHead
        titleI18nKey={Component.titleI18nKey}
        share={Component.share}
        head={Component.head}
        pageProps={pageProps}
      />
      <Layout>{page}</Layout>
    </>
  )
}

export function createPage<P>(
  options: {
    Page: NextPage<P>
  } & PageOptions<P>
): AppPage<P> {
  const page: AppPage<P> = options.Page
  page.titleI18nKey = options.titleI18nKey
  page.share = options.share
  page.head = options.head
  return page
}
