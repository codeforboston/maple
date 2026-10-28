import { useEffect, useRef } from "react"
import {
  useSortBy,
  useConfigure,
  useSearchBox,
  UseConfigureProps
} from "react-instantsearch"
import { SortByItem } from "instantsearch.js/es/connectors/sort-by/connectSortBy"
import Select from "react-select"
import { QuestionTooltip } from "components/tooltip"
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

export const SortBy = ({
  items,
  relevanceValue,
  relevanceHelp
}: {
  items: SortByWithConfigurationItem[]
  /** Opts the page into following the search box: the first item is the
   * default (most recent) sort, and typing a term moves the dropdown to this
   * value, clearing the term moves it back. */
  relevanceValue?: string
  /** Tooltip text shown beside the dropdown saying what Relevance weighs. */
  relevanceHelp?: string
}) => {
  const sortBy = useSortBy({ items }),
    { query } = useSearchBox(),
    hadTerm = useRef(false),
    // A routed URL can restore a sort value that no longer exists — an option
    // renamed since the link was shared. connectSortBy passes it through with
    // only a dev-mode warning, so fall back to the default option instead of
    // crashing the page on `.configure` of undefined.
    selected = items.find(i => i.value === sortBy.currentRefinement) ?? items[0]
  useConfigure(selected.configure ?? {})

  // Only the empty<->term transitions move the dropdown, and only away from
  // the automatic choice, so a sort the user picked sticks. hadTerm starts
  // false, so a URL that loads with a term but no sort lands on Relevance.
  const hasTerm = query.trim() !== ""
  useEffect(() => {
    if (hasTerm === hadTerm.current) return
    hadTerm.current = hasTerm
    if (!relevanceValue) return
    const current = sortBy.currentRefinement
    if (hasTerm && current === items[0].value) sortBy.refine(relevanceValue)
    else if (!hasTerm && current === relevanceValue)
      sortBy.refine(items[0].value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTerm])
  return (
    <span>
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
      {relevanceHelp && selected.value === relevanceValue && (
        <QuestionTooltip text={relevanceHelp} />
      )}
    </span>
  )
}
