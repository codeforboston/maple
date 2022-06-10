import {
  CurrentRefinements,
  Highlight,
  Hits,
  InstantSearch as Base,
  Pagination,
  RefinementListUiComponent,
  SearchBox,
  useRefinementListUiProps
} from "@alexjball/react-instantsearch-hooks-web"
import { faFilter } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Hit } from "instantsearch.js"
import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import TypesenseInstantSearchAdapter, {
  TypesenseInstantsearchAdapterOptions
} from "typesense-instantsearch-adapter"
import { useMediaQuery } from "usehooks-ts"
import { Button, Card, Col, Offcanvas, Row } from "../bootstrap"
import { Internal } from "../links"

const devConfig = {
  key: "iklz4D0Yv3lEYpYxf3e8LQr6tDlIlrvo",
  url: "https://maple.aballslab.com/search"
}

function getServerConfig(): TypesenseInstantsearchAdapterOptions["server"] {
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

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: getServerConfig(),
  additionalSearchParameters: {
    query_by: "number,title,body",
    exclude_fields: "body"
  }
})

const searchClient = typesenseInstantsearchAdapter.searchClient

type BillRecord = {
  number: string
  title: string
  city?: string
  currentCommittee?: string
  testimonyCount: number
  primarySponsor?: string
}

const StyledContainer = styled.div`
  .btn {
    font-size: 0.875rem;
    line-height: 1.5;
    align-self: flex-start;
  }

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
`

export const InstantSearch = () => {
  return (
    <Base indexName="bills" searchClient={searchClient} routing>
      <SearchLayout />
    </Base>
  )
}

const SearchLayout = () => {
  const refinements = useRefinements()
  return (
    <StyledContainer>
      <Row>
        <SearchBox placeholder="Search For Bills" className="mt-2" />
      </Row>
      <Row>
        {refinements.options}
        <Col className="d-flex flex-column">
          <div className="d-flex">
            {refinements.show}
            <CurrentRefinements />
          </div>
          <Hits hitComponent={Hit} />
          <Pagination className="mx-auto mt-2 mb-3" />
        </Col>
      </Row>
    </StyledContainer>
  )
}

const Hit = ({ hit }: { hit: Hit<BillRecord> }) => {
  return (
    <Card className="w-100">
      <Card.Body>
        <Card.Title>
          <Highlight attribute="title" hit={hit} />
        </Card.Title>
        <Card.Subtitle>
          <Internal href={`/bill?id=${hit.number}`}>{hit.number}</Internal>
        </Card.Subtitle>
      </Card.Body>
    </Card>
  )
}

const useRefinements = () => {
  const inline = useMediaQuery("(min-width: 768px)")
  const [show, setShow] = useState(false)
  const handleClose = useCallback(() => setShow(false), [])
  const handleOpen = useCallback(() => setShow(true), [])

  useEffect(() => {
    if (inline) setShow(false)
  }, [inline])

  const baseProps = { limit: 5, searchable: true }
  const refinementProps = [
    useRefinementListUiProps({
      attribute: "city",
      searchablePlaceholder: "City",
      ...baseProps
    }),
    useRefinementListUiProps({
      attribute: "primarySponsor",
      ...baseProps,
      searchablePlaceholder: "Primary Sponsor"
    }),
    useRefinementListUiProps({
      attribute: "currentCommittee",
      ...baseProps,
      searchablePlaceholder: "Current Committee"
    })
  ]

  const refinements = (
    <>
      {refinementProps.map((p, i) => (
        <RefinementListUiComponent className="mb-4" key={i} {...(p as any)} />
      ))}
    </>
  )

  return {
    options: inline ? (
      <Col xs={3} lg={3} className="mt-3">
        {refinements}
      </Col>
    ) : (
      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filter</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <StyledContainer>{refinements}</StyledContainer>
        </Offcanvas.Body>
      </Offcanvas>
    ),
    show: inline ? null : (
      <Button
        className="mb-2 me-2"
        variant="secondary"
        active={show}
        onClick={handleOpen}
      >
        <FontAwesomeIcon icon={faFilter} /> Filter
      </Button>
    )
  }
}
