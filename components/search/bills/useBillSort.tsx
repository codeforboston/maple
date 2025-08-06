import { useMemo, useRef } from "react"
import { SortByWithConfigurationItem } from "../SortBy"
import { useTranslation } from "next-i18next"

export const useBillSort = () => {
  const now = useRef(new Date().getTime())
  const { t } = useTranslation("billSearch")

  // refer to
  // https://github.com/typesense/typesense-instantsearch-adapter#with-react-instantsearch
  const items: SortByWithConfigurationItem[] = useMemo(
    () => [
      {
        label: t("sort_by.most_recent_testimony"),
        value: "bills/sort/latestTestimonyAt:desc"
      },
      {
        label: t("sort_by.relevance"),
        value: "bills/sort/_text_match:desc,testimonyCount:desc"
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
