import styled from "styled-components"

/** Customizations of the default search styling. */
export const SearchContainer = styled.div`
  & {
    font-family: "Nunito";
  }

  .ais-CurrentRefinements-list {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .ais-CurrentRefinements-delete {
    line-height: unset;
    color: white;
    margin-top: auto;
    margin-bottom: auto;
  }

  .ais-CurrentRefinements-item {
    background-color: var(--bs-green);
    color: white;
    border: none;
    font-size: 0.75rem;
    border-radius: 0.75rem;
  }

  .ais-CurrentRefinements--noRefinement {
    height: 0;
  }

  .ais-RefinementList-item {
    font-size: 1rem;
  }

  .ais-RefinementList-list {
    background-color: white;
    padding: 1rem;
    border-radius: 12px;
    margin-top: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .ais-RefinementList-count {
    background: var(--bs-blue);
    color: white;
    font-size: 0.75rem;
    line-height: 1rem;
    padding-right: 10px;
    padding-left: 10px;
    border: none;
  }

  .ais-SearchBox-form {
    background: none;
  }

  .ais-SearchBox-input {
    box-shadow: none;
    border: none;
    border-radius: 4px;
    padding-left: 0.5rem;
    padding-right: 2rem;
    font-size: 1rem;
  }

  .ais-RefinementList-checkbox {
    box-shadow: none;
    outline: 1px solid black;
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

  .ais-Hits-item {
    background: none;
  }

  .ais-Pagination-list {
    flex-wrap: wrap;
  }

  .ais-Pagination-link {
    background-color: var(--bs-blue);
    background-image: unset;
    color: white;
    border: solid 1px var(--bs-body-bg);
    box-shadow: none;
  }

  .ais-Pagination-item:not(.ais-Pagination-item--selected):not(
      .ais-Pagination-item--disabled
    )
    .ais-Pagination-link:hover,
  .ais-Pagination-item--selected .ais-Pagination-link {
    background-color: var(--bs-blue-100);
    color: black;
    background-image: unset;
    border-color: var(--bs-body-bg);
  }

  .ais-FilterButton-has-refinements {
    background: var(--bs-blue-100);
    border-color: var(--bs-blue-100);
    color: var(--bs-blue);
  }
`
