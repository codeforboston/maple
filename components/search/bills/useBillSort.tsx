import { useMemo, useRef } from "react"
import { SortByWithConfigurationItem } from "../SortBy"
import { useTranslation } from "next-i18next"
import { billsRelevanceSort } from "../searchParams"
/** The InstantSearch index name of the default (Most Recent Testimony) sort.
 * It is the bare collection rather than "bills/sort/<sort_by>": the adapter
 * only reads a sort from an index name that has a sort segment, and otherwise
 * uses the sort_by BillSearch.tsx pins on the adapter. BillSearch.tsx keys the
 * page on it and links.tsx keys deep links on it, and it is the qs key of the
 * routed uiState.
 */
export const billsDefaultIndex = "bills"

/** Relevance is an ordinary sort option; SortBy moves to it when a term is
 * typed (see its relevanceValue prop). */
export const billsRelevanceIndex = `bills/sort/${billsRelevanceSort}`

export const useBillSort = () => {
  const now = useRef(new Date().getTime())
  const { t } = useTranslation("search")

  // refer to
  // https://github.com/typesense/typesense-instantsearch-adapter#with-react-instantsearch
  const items: SortByWithConfigurationItem[] = useMemo(
    () => [
      {
        label: t("sort_by.most_recent_testimony"),
        value: billsDefaultIndex
      },
      {
        label: t("sort_by.relevance"),
        value: billsRelevanceIndex
      },
      {
        label: t("sort_by.testimony_count"),
        value: "bills/sort/testimonyCount:desc"
      },
      {
        label: t("sort_by.cosponsor_count"),
        value: "bills/sort/cosponsorCount:desc"
      },
      {
        label: t("sort_by.next_hearing_date"),
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
    [t]
  )
  return items
}
