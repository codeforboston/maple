import { NextPage } from "next"
import { AppProps } from "next/app"
import { ReactElement, ReactNode } from "react"
import V2Layout from "./V2Layout"

export type ApplyLayout = (page: ReactElement) => ReactNode

export type AppPage = NextPage & {
  v2?: boolean
  title?: string
}

export type AppPropsWithLayout = AppProps & {
  Component: AppPage
}

export function applyLayout({ Component, pageProps }: AppPropsWithLayout) {
  const page = <Component {...pageProps} />
  return Component.v2 ? (
    <V2Layout title={Component.title}>{page}</V2Layout>
  ) : (
    page
  )
}

export type PageOptions = {
  title?: string
  v2?: boolean
  Page: NextPage
}

export function createPage(options: PageOptions): AppPage {
  const page: any = options.Page
  page.title = options.title
  page.v2 = options.v2
  return page
}
