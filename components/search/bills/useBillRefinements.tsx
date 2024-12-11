import { generalCourts } from "functions/src/shared"
import { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList"
import { useCallback } from "react"
import { useRefinements } from "../useRefinements"

export const useBillRefinements = () => {
  const baseProps = { limit: 500, searchable: true }
  const propsList = [
    {
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
    },
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
