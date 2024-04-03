import { useRefinementListUiProps } from "@alexjball/react-instantsearch-hooks-web"
import { useRefinements } from "../useRefinements"
import { useCallback } from "react"
import { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList"

export const useTestimonyRefinements = () => {
  const baseProps = { limit: 500, searchable: true }
  const propsList = [
    useRefinementListUiProps({
      transformItems: useCallback(
        (i: RefinementListItem[]) => i.filter(i => i.label !== "private"),
        []
      ),
      attribute: "authorDisplayName",
      ...baseProps,
      searchablePlaceholder: "Author Name"
    }),
    useRefinementListUiProps({
      attribute: "court",
      ...baseProps,
      searchablePlaceholder: "Court"
    }),
    useRefinementListUiProps({
      attribute: "position",
      ...baseProps,
      searchablePlaceholder: "Position"
    }),
    useRefinementListUiProps({
      attribute: "billId",
      ...baseProps,
      searchablePlaceholder: "Bill"
    }),
    useRefinementListUiProps({
      attribute: "authorRole",
      ...baseProps,
      searchable: false,
      hidden: true
    })
  ]

  return useRefinements({ refinementProps: propsList })
}
