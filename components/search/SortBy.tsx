import { useSortBy, useConfigure, UseConfigureProps } from "react-instantsearch"
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
    background-color: var(--maple-color-blue-subtle-bg);
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

  /* Digital Democracy and Mixed: the sort text a step smaller, menu included. */
  [data-maple-theme="dd"] & .s__control,
  [data-maple-theme="dd"] & .s__menu {
    font-size: 0.875rem;
  }

  /* The selected value a step bolder; the menu stays regular. */
  [data-maple-theme="dd"] & .s__control {
    font-weight: 500;
  }

  /* Below 992px, where the filters collapse to the filter button
     (components/search/useFiltersInline.ts), a step bolder again. */
  @media (max-width: 991.98px) {
    [data-maple-theme="dd"] & .s__control {
      font-weight: 600;
    }
  }
`

export type SortByWithConfigurationItem = SortByItem & {
  configure?: UseConfigureProps
}

export const SortBy = ({ items }: { items: SortByWithConfigurationItem[] }) => {
  const sortBy = useSortBy({ items }),
    // A routed URL can restore a sort value that no longer exists — an option
    // renamed since the link was shared. connectSortBy passes it through with
    // only a dev-mode warning, so fall back to the default option instead of
    // crashing the page on `.configure` of undefined.
    selected = items.find(i => i.value === sortBy.currentRefinement) ?? items[0]
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
