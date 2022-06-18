import styled from "styled-components"
import { TypesenseInstantsearchAdapterOptions } from "typesense-instantsearch-adapter"
import { Button } from "../bootstrap"

const devConfig = {
  key: "iklz4D0Yv3lEYpYxf3e8LQr6tDlIlrvo",
  url: "https://maple.aballslab.com/search"
}

export function getServerConfig(): TypesenseInstantsearchAdapterOptions["server"] {
  const key = process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY ?? devConfig.key
  const url = new URL(
    process.env.NEXT_PUBLIC_TYPESENSE_API_URL ?? devConfig.url
  )

  const protocol = url.protocol.startsWith("https") ? "https" : "http"
  const port = url.port ? Number(url.port) : protocol === "https" ? 443 : 80

  return {
    apiKey: key,
    nodes: [
      {
        host: url.hostname,
        protocol,
        port,
        path: url.pathname
      }
    ]
  }
}

export const FilterButton = styled(Button)`
  font-size: 0.875rem;
  line-height: 1.5;
  align-self: flex-start;
`

/** Customizations of the default search styling. */
export const SatelliteCustomization = styled.div`
  .ais-CurrentRefinements-list {
    display: inline-flex;
    flex-wrap: wrap;
  }

  .ais-CurrentRefinements-delete {
    line-height: unset;
    color: white;
  }

  .ais-CurrentRefinements-item {
    background-color: var(--bs-blue);
    color: white;
    border: none;
  }

  .ais-CurrentRefinements,
  .btn {
    margin: 1rem 0 0.5rem 0;
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
    font-size: 0.6rem;
    line-height: 0.8rem;
    padding-right: 10px;
    padding-left: 10px;
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
  }

  .ais-RefinementList-checkbox {
    display: none;
  }

  .ais-SearchBox-form::after {
    background-color: var(--bs-blue);
    mask: url("search-solid.svg");
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

  .ais-Pagination-item:not(.ais-Pagination-item--selected):not(.ais-Pagination-item--disabled)
    .ais-Pagination-link:hover,
  .ais-Pagination-item--selected .ais-Pagination-link {
    background-color: var(--bs-blue-100);
    color: black;
    background-image: unset;
    border-color: var(--bs-body-bg);
  }

  .ais-SortBy-select {
    box-shadow: none;
    margin: 1rem 1rem 1rem 0;
    width: 15rem;
    font-size: 1rem;
    line-height: 1.3125rem;
    padding: 0.5rem 2.5rem 0.5rem 1rem;
    height: unset;
    border-color: white;

    &:focus {
      border-color: var(--bs-blue);
    }
  }
`
