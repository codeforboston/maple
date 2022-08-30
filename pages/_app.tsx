// Order is important! Leave the empty lines, it prevents IDE's from
// autosorting.

import "../styles/bootstrap.scss"

import "../styles/globals.css"

import "../components/fontawesome"

import "../styles/instantsearch.css"

import "instantsearch.css/themes/satellite.css"

import { applyLayout, AppPropsWithLayout } from "../components/page"
import { Providers } from "../components/providers"

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
function App(props: AppPropsWithLayout) {
  return <Providers>{applyLayout(props)}</Providers>
}

export default App
