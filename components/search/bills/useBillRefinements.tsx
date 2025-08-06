import { generalCourts } from "functions/src/shared"
import { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList"
import { useCallback, useMemo } from "react"
import { useRefinements } from "../useRefinements"
import { useTranslation } from "next-i18next"

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

export const useBillRefinements = () => {
  const baseProps = { limit: 500, searchable: true }
  const { t } = useTranslation("search")
  const propsList = useMemo(
    () =>
      [
        {
          transformItems: useCallback(
            (items: RefinementListItem[]) =>
              items
                .map(i => ({
                  ...i,
                  label: generalCourts[parseInt(i.value, 10)]?.Name ?? i.label
                }))
                .sort((a, b) => Number(b.value) - Number(a.value)),
            []
          ),
          attribute: "court"
        },
        { attribute: "currentCommittee" },
        { attribute: "city" },
        { attribute: "primarySponsor" },
        { attribute: "cosponsors" }
      ].map(props => ({
        searchablePlaceholder: t(`refinements.bill.${props.attribute}`),
        ...baseProps,
        ...props
      })),
    [t]
  )

  const hierarchicalPropsList = [
    {
      attribute: "topics.lvl0",
      ...baseProps
    },
    {
      attribute: "topics.lvl1",
      ...baseProps
    }
  ]

  return useRefinements({
    hierarchicalMenuProps: hierarchicalPropsList,
    refinementProps: propsList
  })
}
