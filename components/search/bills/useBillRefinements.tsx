import { generalCourts } from "functions/src/shared"
import { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList"
import { useMemo } from "react"
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
  const { t } = useTranslation("search")

  return useRefinements({
    hierarchicalMenuProps: { attributes: ["topics.lvl0", "topics.lvl1"] },
    refinementProps: useMemo(
      () =>
        [
          {
            transformItems: (items: RefinementListItem[]) =>
              items
                .map(i => ({
                  ...i,
                  label: generalCourts[parseInt(i.value, 10)]?.Name ?? i.label
                }))
                .sort((a, b) => Number(b.value) - Number(a.value)),

            attribute: "court"
          },
          { attribute: "currentCommittee" }
        ].map(props => ({
          limit: 500,
          searchable: true,
          searchablePlaceholder: t(`refinements.bill.${props.attribute}`),
          ...props
        })),
      [t]
    ),
    refinementProps2: useMemo(
      () =>
        [
          {
            transformItems: (items: RefinementListItem[]) =>
              items
                .map(i => ({
                  ...i,
                  label: generalCourts[parseInt(i.value, 10)]?.Name ?? i.label
                }))
                .sort((a, b) => Number(b.value) - Number(a.value)),

            attribute: "city"
          },
          { attribute: "primarySponsor" },
          { attribute: "cosponsors" }
        ].map(props => ({
          limit: 500,
          searchable: true,
          searchablePlaceholder: t(`refinements.bill.${props.attribute}`),
          ...props
        })),
      [t]
    )
  })
}
