import {
  useSortBy,
  useConfigure,
  UseConfigureProps
} from "@alexjball/react-instantsearch-hooks-web"
import { SortByItem } from "instantsearch.js/es/connectors/sort-by/connectSortBy"
import Select from "react-select"
import styled from "styled-components"

const StyledSelect = styled(Select)`
  .s__control {
    background-color: var(--bs-blue);
    border: none;
    box-shadow: none;
    min-height: 1rem;
    line-height: 1rem;
    cursor: pointer;
  }

  .s__option--is-selected {
    background-color: transparent;
    color: black;
  }

  .s__option--is-selected:hover {
    background-color: #deebff;
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

export type SortByWithConfigurationItem = SortByItem & {
  configure?: UseConfigureProps
}

export const SortBy = ({ items }: { items: SortByWithConfigurationItem[] }) => {
  const sortBy = useSortBy({ items }),
    selected = items.find(i => i.value === sortBy.currentRefinement)!
  useConfigure(selected.configure ?? {})
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
