import { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList"
import { useRefinements } from "../useRefinements"
import { ReactNode, useMemo } from "react"
import { useTranslation } from "next-i18next"

export const useTestimonyRefinements = (leadingFilters?: ReactNode) => {
  const { t } = useTranslation("search")

  return useRefinements({
    leadingFilters,
    refinementProps: useMemo(
      () =>
        [
          {
            transformItems: (i: RefinementListItem[]) =>
              i.filter(i => i.label !== "private"),
            attribute: "authorDisplayName"
          },
          { attribute: "court" },
          { attribute: "position" },
          { attribute: "billId" },
          { attribute: "authorRole", searchable: false, hidden: true }
        ].map(props => ({
          limit: 500,
          searchable: true,
          searchablePlaceholder: t(`refinements.testimony.${props.attribute}`),
          ...props
        })),
      [t]
    )
  })
}
