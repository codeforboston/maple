import { UiState } from "instantsearch.js"
import QueryString from "qs"

export const searchStateToUrl = (createUrlArgs: {
  location: Location
  qsModule: typeof QueryString
  routeState: UiState
}) => {
  const { location, qsModule: qs, routeState: searchState } = createUrlArgs
  const base = location.origin + location.pathname

  const flagQueries = Object.fromEntries(
    Object.entries(qs.parse(window.location.search.slice(1))).filter(
      ([key]) => !Object.keys(searchState).includes(key)
    )
  )

  const query = qs.stringify({
    ...searchState,
    ...flagQueries
  })

  return query ? `${base}?${query}` : base
}

export const pathToSearchState = (parseUrlArgs: {
  location: Location
  qsModule: typeof QueryString
}) => {
  const { location, qsModule: qs } = parseUrlArgs
  const path = location.href

  // A higher arrayLimit than qs's 20, past which numbered entries
  // (court[0], court[1], ...) are read as an object rather than a list. The
  // homepage's topic links select dozens of subtopics, and this page writes
  // them back to the address numbered.
  return (
    path.includes("?")
      ? qs.parse(path.substring(path.indexOf("?") + 1), { arrayLimit: 500 })
      : {}
  ) as UiState
}
