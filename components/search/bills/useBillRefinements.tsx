import { legislativeSessions } from "functions/src/shared"
import { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList"
import { useCallback } from "react"
import { useRefinements } from "../useRefinements"

export const useSessionRefinements = () => {
  const baseProps = { limit: 500, searchable: true }
  const propsList = [
    {
      transformItems: useCallback(
        (i: RefinementListItem[]) =>
          i
            .map(i => ({
              ...i,
              label: legislativeSessions[i.value as any]?.Name ?? i.label
            }))
            .sort((a, b) => Number(b.value) - Number(a.value)),
        []
      ),
      attribute: "court",
      // `court` should be `session` but 404 - Could not find a facet field named `session` in the schema.
      //
      // needs adjusting? :
      // node_modules\typesense-instantsearch-adapter\lib\TypesenseInstantsearchAdapter.js
      //
      // see also BillSearch.tsx:
      //   refinementList: { court: [String(currentLegislativeSession)] }
      searchablePlaceholder: "Legislative Session",
      ...baseProps
    }
  ]

  return useRefinements({ refinementProps: propsList })
}

export const useBillRefinements = () => {
  const baseProps = { limit: 500, searchable: true }
  const propsList = [
    {
      attribute: "currentCommittee",
      ...baseProps,
      searchablePlaceholder: "Current Committee"
    },
    {
      attribute: "city",
      searchablePlaceholder: "City",
      ...baseProps
    },
    {
      attribute: "primarySponsor",
      ...baseProps,
      searchablePlaceholder: "Primary Sponsor"
    },
    {
      attribute: "cosponsors",
      ...baseProps,
      searchablePlaceholder: "Cosponsor"
    }
  ]

  return useRefinements({ refinementProps: propsList })
}
