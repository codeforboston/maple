import { useRefinementListUiProps } from "@alexjball/react-instantsearch-hooks-web"
import { generalCourts } from "functions/src/shared"
import { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList"
import { useCallback } from "react"
import { useRefinements } from "../useRefinements"

export const useBillRefinements = () => {
  const baseProps = { limit: 500, searchable: true }
  const propsList = [
    useRefinementListUiProps({
      transformItems: useCallback(
        (i: RefinementListItem[]) =>
          i
            .map(i => ({
              ...i,
              label: generalCourts[i.value as any]?.Name ?? i.label
            }))
            .sort((a, b) => Number(b.value) - Number(a.value)),
        []
      ),
      attribute: "court",
      searchablePlaceholder: "General Court",
      ...baseProps
    }),
    useRefinementListUiProps({
      attribute: "currentCommittee",
      ...baseProps,
      searchablePlaceholder: "Current Committee"
    }),
    useRefinementListUiProps({
      attribute: "city",
      searchablePlaceholder: "City",
      ...baseProps
    }),
    useRefinementListUiProps({
      attribute: "primarySponsor",
      ...baseProps,
      searchablePlaceholder: "Primary Sponsor"
    }),
    useRefinementListUiProps({
      attribute: "cosponsors",
      ...baseProps,
      searchablePlaceholder: "Cosponsor"
    })
  ]

  return useRefinements({ refinementProps: propsList })
}
