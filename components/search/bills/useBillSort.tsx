import { useMemo, useRef } from "react"
import { SortByWithConfigurationItem } from "../SortBy"
import { useTranslation } from "next-i18next"
/** The InstantSearch index name of the default (Relevance) sort. It is the
 * bare collection rather than "bills/sort/<sort_by>": the adapter only reads a
 * sort from an index name that has a sort segment, and otherwise uses the
 * sort_by BillSearch.tsx pins on the adapter. That keeps the long relevance
 * clause out of Browse Bills URLs, where the index name is the qs key of the
 * routed uiState (it would vanish entirely under InstantSearch's singleIndex
 * state mapping, which the router does not use yet). BillSearch.tsx keys the
 * page on it and links.tsx keys deep links on it.
 */
export const billsDefaultIndex = "bills"

export const useBillSort = () => {
  const now = useRef(new Date().getTime())
  const { t } = useTranslation("search")

  // refer to
  // https://github.com/typesense/typesense-instantsearch-adapter#with-react-instantsearch
  const items: SortByWithConfigurationItem[] = useMemo(
    () => [
      {
        label: t("sort_by.relevance"),
        value: billsDefaultIndex
      },
      {
        label: t("sort_by.most_recent_testimony"),
        value: "bills/sort/latestTestimonyAt:desc"
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
