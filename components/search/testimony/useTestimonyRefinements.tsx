import { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList"
import { useRefinements } from "../useRefinements"
import { useMemo } from "react"
import { useTranslation } from "next-i18next"

export const useTestimonyRefinements = () => {
  const { t } = useTranslation("search")

  return useRefinements({
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
