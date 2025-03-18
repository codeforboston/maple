import { generalCourts } from "functions/src/shared"
import { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList"
import { useCallback } from "react"
import { useRefinements } from "../useRefinements"

// for legacy code purposes, things like:
//
//   `legislative session` and `session`
//
// are used by variables that are named things like:
//
//   `general court` and `court`
//
// see example below:
//
//   attribute: "court",
//   searchablePlaceholder: "Legislative Session",

export const useBillRefinements = (list: Number) => {
  const baseProps = { limit: 500, searchable: true }
  const propsList1 = [
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
      searchablePlaceholder: "Legislative Session",
      ...baseProps
    }
  ]
  const propsList2 = [
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

  let propsList = []
  if (list === 1) {
    propsList = propsList1
  } else {
    propsList = propsList2
  }

  return useRefinements({ refinementProps: propsList })
}
