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
  return <Layout title={Component.title}>{page}</Layout>
}

export type PageOptions<P> = {
  title?: string
  fullWidth?: boolean
  Page: NextPage<P>
}

export function createPage<P>(options: PageOptions<P>): AppPage<P> {
  const page: AppPage<P> = options.Page
  page.title = options.title
  return page
}
