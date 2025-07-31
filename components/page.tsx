import { NextPage } from "next"
import { AppProps } from "next/app"
import { ReactElement, ReactNode } from "react"
import { Layout, LayoutProps } from "./layout"

export type ApplyLayout = (page: ReactElement) => ReactNode

export type AppPage<P> = NextPage<P> & LayoutProps

export type AppPropsWithLayout = AppProps & {
  Component: AppPage<any>
}

export function applyLayout({ Component, pageProps }: AppPropsWithLayout) {
  const page = <Component {...pageProps} />
  return <Layout titleI18nKey={Component.titleI18nKey}>{page}</Layout>
}

export function createPage<P>(
  options: {
    Page: NextPage<P>
  } & LayoutProps
): AppPage<P> {
  const page: AppPage<P> = options.Page
  page.titleI18nKey = options.titleI18nKey
  return page
}
