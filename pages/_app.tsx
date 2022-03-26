import "../components/fontawesome"
import { applyLayout, AppPropsWithLayout } from "../components/page"
import { Providers } from "../components/providers"
import "../styles/bootstrap.scss"
import "../styles/globals.css"
import "../styles/Map.css"

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
