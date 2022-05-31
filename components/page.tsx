import { NextPage } from "next"
import { AppProps } from "next/app"
import { ReactElement, ReactNode } from "react"
import { Layout, LayoutProps } from "./layout"

export type ApplyLayout = (page: ReactElement) => ReactNode

export type AppPage = NextPage & LayoutProps

export type AppPropsWithLayout = AppProps & {
  Component: AppPage
}

export function applyLayout({ Component, pageProps }: AppPropsWithLayout) {
  const page = <Component {...pageProps} />
  return <Layout title={Component.title}>{page}</Layout>
}

export type PageOptions = {
  title?: string
  fullWidth?: boolean
  Page: NextPage
}

export function createPage(options: PageOptions): AppPage {
  const page: AppPage = options.Page
  page.title = options.title
  return page
}
