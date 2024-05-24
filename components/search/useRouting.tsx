import { UiState } from "instantsearch.js"
import { RouterProps } from "instantsearch.js/es/middlewares"
import Router from "next/router"
import qs from "qs"
import { useMemo } from "react"

const pathToSearchState = (path: string) =>
  (path.includes("?")
    ? qs.parse(path.substring(path.indexOf("?") + 1))
    : {}) as UiState

const searchStateToUrl = (searchState: UiState) => {
  const base = window.location.pathname

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

export function useRouting(): RouterProps<UiState, UiState> {
  return useMemo(() => {
    let disposed = false
    return {
      router: {
        createURL: searchStateToUrl,
        dispose() {
          disposed = true
          // Clear back listener
          Router.beforePopState(() => true)
        },
        onUpdate(callback) {
          Router.beforePopState(({ url }) => {
            callback(pathToSearchState(url))
            return true
          })
        },
        read: () => pathToSearchState(window.location.href),
        write(route) {
          if (disposed) return
          const url = searchStateToUrl(route)
          Router.push(url, url, { shallow: true })
        }
      }
    }
  }, [])
}
