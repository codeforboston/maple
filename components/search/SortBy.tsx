import { useSortBy } from "@alexjball/react-instantsearch-hooks-web"
import { SortByItem } from "instantsearch.js/es/connectors/sort-by/connectSortBy"
import Select from "react-select"
import styled from "styled-components"

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

export const SortBy = ({ items }: { items: SortByItem[] }) => {
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
