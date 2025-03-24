import { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList"
import { useRefinements } from "../useRefinements"
import { useCallback } from "react"

export const useTestimonyRefinements = () => {
  const baseProps = { limit: 500, searchable: true }
  const propsList = [
    {
      transformItems: useCallback(
        (i: RefinementListItem[]) => i.filter(i => i.label !== "private"),
        []
      ),
      attribute: "authorDisplayName",
      ...baseProps,
      searchablePlaceholder: "Author Name"
    },
    {
      attribute: "court",
      ...baseProps,
      searchablePlaceholder: "Court"
    },
    {
      attribute: "position",
      ...baseProps,
      searchablePlaceholder: "Position"
    },
    {
      attribute: "billId",
      ...baseProps,
      searchablePlaceholder: "Bill"
    },
    {
      attribute: "authorRole",
      ...baseProps,
      searchable: false,
      hidden: true
    }
  ]

  return useRefinements({ refinementProps: propsList })
}
