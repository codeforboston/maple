import { useMemo, useRef } from "react"
import { SortByWithConfigurationItem } from "../SortBy"

export const useBillSort = () => {
  const now = useRef(new Date().getTime())

  // refer to
  // https://github.com/typesense/typesense-instantsearch-adapter#with-react-instantsearch
  const items: SortByWithConfigurationItem[] = useMemo(
    () => [
      {
        label: "Sort by Most Recent Testimony",
        value: "bills/sort/latestTestimonyAt:desc"
      },
      {
        label: "Sort by Relevance",
        value: "bills/sort/_text_match:desc,testimonyCount:desc"
      },
      {
        label: "Sort by Testimony Count",
        value: "bills/sort/testimonyCount:desc"
      },
      {
        label: "Sort by Cosponsor Count",
        value: "bills/sort/cosponsorCount:asc"
      },
      {
        label: "Sort by Next Hearing Date",
        value: "bills/sort/nextHearingAt:asc",
        configure: {
          numericRefinements: {
            nextHearingAt: {
              ">=": [now.current]
            } as any
          }
        }
      }
    ],
    []
  )
  return items
}
