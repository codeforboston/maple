import { useSortBy } from "@alexjball/react-instantsearch-hooks-web"
import { SortByItem } from "instantsearch.js/es/connectors/sort-by/connectSortBy"
import Select from "react-select"
import styled from "styled-components"

const items: SortByItem[] = [
  {
    label: "Sort by Most Recent Testimony",
    value: "bills/sort/latestTestimonyAt:desc"
  },
  {
    label: "Sort by Relevance",
    value: "bills/sort/_text_match:desc,testimonyCount:desc"
  },
  { label: "Sort by Testimony Count", value: "bills/sort/testimonyCount:desc" },
  {
    label: "Sort by Cosponsor Count",
    value: "bills/sort/cosponsorCount:desc"
  },
  {
    label: "Sort by Next Hearing Date",
    value: "bills/sort/nextHearingAt:desc"
  }
]

export const initialSortByValue = items[0].value

const StyledSelect = styled(Select)`
  .s__control {
    background-color: var(--bs-blue);
    border: none;
    min-height: 1rem;
    line-height: 1rem;
    cursor: pointer;
  }

  .s__single-value,
  .s__indicator {
    color: white;
  }

  .s__indicator svg {
    height: 1rem;
  }

  .s__indicator:hover {
    color: var(--bs-gray-500);
  }
`

export const SortBy = () => {
  const sortBy = useSortBy({ items }),
    selected = items.find(i => i.value === sortBy.currentRefinement)!
  return (
    <StyledSelect
      classNamePrefix="s"
      isSearchable={false}
      isClearable={false}
      value={selected}
      options={sortBy.options}
      onChange={(e: any) => {
        if (e) sortBy.refine(e.value)
      }}
    />
  )
}
