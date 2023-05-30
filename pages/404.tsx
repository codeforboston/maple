import ErrorPage from "next/error"
import { createGetStaticTranslationProps } from "components/translations"

export default function NotFound() {
  return <ErrorPage statusCode={404} withDarkMode={false} />
}

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "testimony"
])
