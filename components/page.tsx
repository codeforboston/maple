import { NextPage } from "next"
import { AppProps } from "next/app"
import { ReactElement, ReactNode } from "react"
import { Layout, LayoutProps } from "./layout"
import { ShareHead, ShareMeta } from "./ShareHead"

export type ApplyLayout = (page: ReactElement) => ReactNode

export type AppPage<P> = NextPage<P> &
  LayoutProps & {
    /** Link-preview tags, for pages meant to be shared. */
    share?: ShareMeta
  }

export type AppPropsWithLayout = AppProps & {
  Component: AppPage<any>
}

export function applyLayout({ Component, pageProps }: AppPropsWithLayout) {
  const page = <Component {...pageProps} />
  return (
    <>
      {Component.share && <ShareHead share={Component.share} />}
      <Layout titleI18nKey={Component.titleI18nKey}>{page}</Layout>
    </>
  )
}

export function createPage<P>(
  options: {
    Page: NextPage<P>
    share?: ShareMeta
  } & LayoutProps
): AppPage<P> {
  const page: AppPage<P> = options.Page
  page.titleI18nKey = options.titleI18nKey
  page.share = options.share
  return page
}
