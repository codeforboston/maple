import { useRefinementListUiProps } from "@alexjball/react-instantsearch-hooks-web"
import { useRefinements } from "../useRefinements"

export const useTestimonyRefinements = () => {
  const baseProps = { limit: 500, searchable: true }
  const propsList = [
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
    })
  ]

  return useRefinements({ refinementProps: propsList })
}
