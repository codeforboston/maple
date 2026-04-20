import styled from "styled-components"

/** Customizations of the default search styling. */
export const SearchContainer = styled.div`
  .ais-CurrentRefinements-list {
    display: inline-flex;
    flex-wrap: wrap;
    gap: var(--maple-space-sm);
  }

  .ais-CurrentRefinements-delete {
    line-height: unset;
    color: var(--maple-text-inverse);
    margin-top: auto;
    margin-bottom: auto;
  }

  .ais-CurrentRefinements-item {
    background-color: var(--bs-green);
    color: var(--maple-text-inverse);
    border: none;
    font-size: 0.75rem;
    border-radius: 0.75rem;
  }

  .ais-CurrentRefinements--noRefinement {
    display: none;
  }

  .ais-RefinementList-item {
    font-size: 0.9rem;
  }

  .ais-RefinementList-list {
    padding: 0;
    padding-right: var(--maple-space-lg);
    margin: 0;
    max-height: 200px;
    overflow-y: auto;
  }

  .ais-RefinementList-searchBox {
    margin-bottom: var(--maple-space-sm);

    .ais-SearchBox-input {
      font-size: 0.85rem;
      padding-top: 0.25rem;
      padding-bottom: 0.25rem;
    }
  }

  .ais-RefinementList-count {
    background: var(--bs-blue);
    color: var(--maple-text-inverse);
    font-size: 0.75rem;
    line-height: 1rem;
    padding-right: var(--maple-space-md);
    padding-left: var(--maple-space-md);
    border: none;
    border-radius: var(--maple-radius-pill);
  }

  .ais-SearchBox-form {
    background: none;
  }

  .ais-SearchBox-input {
    box-shadow: none;
    border: 1px solid var(--maple-border-default);
    border-radius: var(--maple-radius-sm);
    padding-top: 0.65rem;
    padding-bottom: 0.65rem;
    padding-left: var(--maple-space-sm);
    padding-right: 2rem;
    font-size: 1rem;
    background-color: var(--maple-surface-base);
  }

  .ais-SearchBox-form {
    margin-bottom: 0;
  }

  .ais-RefinementList-checkbox {
    box-shadow: none;
    outline: 1px solid var(--maple-border-default);
    border-radius: 1px;
    color: var(--bs-blue);
  }

  .ais-RefinementList-item--selected .ais-RefinementList-checkbox {
    background-image: url("/check-solid.svg");
    background-size: 0.75rem;
    background-position: center;
    background-repeat: no-repeat;
  }

  .ais-SearchBox-form::after {
    background-color: var(--bs-blue);
    mask: url("/search-solid.svg");
    content: "";
    height: 1rem;
    right: 0.5rem;
    margin-top: -0.5rem;
    transform: scale(-1, 1);
    position: absolute;
    top: 50%;
    width: 1rem;
  }

  .ais-SearchBox-reset,
  .ais-SearchBox-loadingIndicator {
    right: 2rem;
  }

  .ais-SearchBox-form::before {
    display: none;
  }

  .ais-Hits-list {
    columns: 2;
    column-gap: 1.15rem;

    @media (max-width: 768px) {
      columns: 1;
    }
  }

  .ais-Hits-item {
    background: none;
    break-inside: avoid;
    margin-bottom: 1.15rem;
  }

  .ais-Pagination-list {
    flex-wrap: wrap;
  }

  .ais-Pagination-link {
    background-color: var(--bs-blue);
    background-image: unset;
    color: var(--maple-text-inverse);
    border: solid 1px var(--bs-body-bg);
    box-shadow: none;
  }

  .ais-Pagination-item:not(.ais-Pagination-item--selected):not(
      .ais-Pagination-item--disabled
    )
    .ais-Pagination-link:hover,
  .ais-Pagination-item--selected .ais-Pagination-link {
    background-color: var(--bs-blue-100);
    color: var(--maple-text-body);
    background-image: unset;
    border-color: var(--bs-body-bg);
  }

  .ais-FilterButton-has-refinements {
    background: var(--bs-blue-100);
    border-color: var(--bs-blue-100);
    color: var(--bs-blue);
  }

  .ais-RefinementList-labelText {
    white-space: normal;
    display: inline-block;
    width: 75%;
    line-height: 1.25;
  }

  .ais-RefinementList-label {
    border-bottom: dashed 1px;
  }

  .ais-MultiselectHierarchicalMenu-list {
    padding: 0;
    margin: 0;
    max-height: 200px;
    overflow-y: auto;
    list-style: none;
  }

  .ais-MultiselectHierarchicalMenu-item {
    font-size: 1rem;
    border-bottom: dashed 1px;
  }

  .ais-MultiselectHierarchicalMenu-label {
    white-space: normal;
    display: flex;
    width: 100%;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }

  .ais-MultiselectHierarchicalMenu-count {
    background: var(--bs-blue);
    color: var(--maple-text-inverse);
    font-size: 0.75rem;
    line-height: 1rem;
    padding-right: var(--maple-space-md);
    padding-left: var(--maple-space-md);
    border-radius: var(--maple-radius-pill);
    border: none;
    cursor: pointer;
  }
  .ais-MultiselectHierarchicalMenu-toggle {
    font-size: 30px;
    color: var(--bs-blue);
    vertical-align: middle;
    /* margin-bottom: 1rem; */
    background-color: transparent;
    border: none;
    padding: 0%;
    cursor: pointer;
  }

  .ais-MultiselectHierarchicalMenu-list--child {
    display: inline-block;
    overflow-y: visible;
    margin: 0;
    padding: 0 0 0 4px;
    width: 100%;
    list-style: none;
  }

  .ais-MultiselectHierarchicalMenu-checkbox--child {
    box-shadow: none;
    outline: 1px solid black;
    border-radius: 1px;
    color: var(--bs-blue);
    cursor: pointer;
    appearance: none;
    background-color: var(--maple-surface-base);
    border: 1px solid var(--bs-blue);
    height: 1rem;
    margin: 0 var(--maple-space-sm) 0 0;
    min-width: 1rem;
  }

  .ais-MultiselectHierarchicalMenu-item--child--selected
    .ais-MultiselectHierarchicalMenu-checkbox--child {
    background-image: url("/check-solid.svg");
    background-size: 0.75rem;
    background-position: center;
    background-repeat: no-repeat;
  }

  .ais-MultiselectHierarchicalMenu-item--selected
    .ais-MultiselectHierarchicalMenu-label {
    font-weight: bold;
  }

  .ais-MultiselectHierarchicalMenu-label--child {
    white-space: normal;
    display: flex;
    width: 100%;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }

  .ais-MultiselectHierarchicalMenu-item--child--selected
    .ais-MultiselectHierarchicalMenu-label--child {
    font-weight: bold;
  }

  .ais-MultiselectHierarchicalMenu-item--child {
    font-size: 1rem;
    border-top: dashed 1px;
  }

  .ais-MultiselectHierarchicalMenu-count--child {
    background: var(--bs-blue);
    color: var(--maple-text-inverse);
    font-size: 0.75rem;
    line-height: 1rem;
    padding-right: var(--maple-space-md);
    padding-left: var(--maple-space-md);
    border-radius: var(--maple-radius-pill);
    border: none;
    cursor: pointer;
  }
`
