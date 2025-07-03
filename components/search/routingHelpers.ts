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

  return (
    path.includes("?") ? qs.parse(path.substring(path.indexOf("?") + 1)) : {}
  ) as UiState
}
