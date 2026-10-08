// Order is important! Leave the empty lines, it prevents IDE's from
// autosorting.

import "../styles/bootstrap.scss"

import "../styles/globals.css"

import "../components/fontawesome"

import "../styles/instantsearch.css"

import "instantsearch.css/themes/satellite.css"

import { applyLayout, AppPropsWithLayout } from "../components/page"
import { Providers } from "../components/providers"
import { wrapper } from "../components/store"
import { Provider as Redux } from "react-redux"
import { appWithTranslation } from "next-i18next"
import nextI18NextConfig from "../next-i18next.config"
import dynamic from "next/dynamic"

/**
 * The skin switcher is for `next dev`, and for demo deployments that set
 * NEXT_PUBLIC_THEME_SWITCHER=on. Next.js replaces both with constants at build
 * time, so in any other build this is `() => null` and the import is removed
 * along with the dead branch. MAPLE's own deployments do not set it.
 */
const DevSkinToggle =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_THEME_SWITCHER === "on"
    ? dynamic(() => import("../components/DevSkinToggle"), { ssr: false })
    : () => null

/**
 * The root React component of the application. Next.js renders this, passing
 * the component of the current page. When you navigate to a new page, Next.js
 * performs client-side routing by re-rendering this component with the new
 * page's component. Generally we want to persist providers and layouts between
 * pages, so they are rendered directly inside the app component rather than
 * inside a page component. This allows react to only remount the page content.
 *
 * See https://nextjs.org/docs/basic-features/layouts for the pattern.
 */
function App({ Component, ...rest }: AppPropsWithLayout) {
  const { store, props } = wrapper.useWrappedStore(rest)
  return (
    <Redux store={store}>
      {props.router.pathname === "/admin" ? (
        <Providers>
          <Component />
        </Providers>
      ) : (
        <Providers>{applyLayout({ Component, ...props })}</Providers>
      )}
      <DevSkinToggle />
    </Redux>
  )
}

const WrappedApp = appWithTranslation(App, nextI18NextConfig)

export default WrappedApp
