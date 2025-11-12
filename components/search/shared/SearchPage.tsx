import { Hit, UiState } from "instantsearch.js"
import { TFunction, useTranslation } from "next-i18next"
import singletonRouter from "next/router"
import { ComponentType, ReactNode, useMemo } from "react"
import {
  CurrentRefinements,
  CurrentRefinementsProps,
  InstantSearch,
  Pagination,
  SearchBox
} from "react-instantsearch"
import { createInstantSearchRouterNext } from "react-instantsearch-router-nextjs"
import styled from "styled-components"
import TypesenseInstantSearchAdapter, {
  TypesenseInstantsearchAdapterOptions
} from "typesense-instantsearch-adapter"
import { Col, Row } from "../../bootstrap"
import { ResultCount } from "../ResultCount"
import { pathToSearchState, searchStateToUrl } from "../routingHelpers"
import { SearchContainer } from "../SearchContainer"
import { SortBy, SortByWithConfigurationItem } from "../SortBy"
import { RefinementPanel, RefinementPanelConfig } from "./RefinementPanel"
import { VirtualRefinements } from "./VirtualRefinements"
import { ResultsPane } from "./ResultsPane"
import { getServerConfig } from "../common"
import { SearchErrorBoundary } from "../SearchErrorBoundary"

const RefinementToolbar = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
`

export type SearchType = "bill" | "testimony" | "hearing"

const defaultRefinementProps = (
  attribute: string,
  searchType: SearchType,
  t: TFunction
) => ({
  limit: 500,
  searchable: true,
  searchablePlaceholder: t(`refinements.${searchType}.${attribute}`)
})

export type SortOptionInput = {
  labelKey: string
  value: string
  configure?: SortByWithConfigurationItem["configure"]
}

type SearchPageProps<TRecord extends Hit> = {
  searchType: SearchType
  header?: ReactNode
  filterPanelConfig: RefinementPanelConfig
  currentRefinementsProps?: CurrentRefinementsProps
  hitComponent: ComponentType<{ hit: TRecord }>
  sortOptions: SortOptionInput[]
  initialUiState?: UiState
  searchParameters: NonNullable<
    TypesenseInstantsearchAdapterOptions["additionalSearchParameters"]
  >
}

export const SearchPage = <TRecord extends Hit>({
  searchType,
  header,
  hitComponent,
  filterPanelConfig,
  currentRefinementsProps = {},
  sortOptions,
  initialUiState,
  searchParameters
}: SearchPageProps<TRecord>) => {
  const { t } = useTranslation("search")
  const sortByItems = useMemo<SortByWithConfigurationItem[]>(
    () =>
      sortOptions.map(({ labelKey, ...opts }) => ({
        label: t(labelKey),
        ...opts
      })),
    [sortOptions, t]
  )
  const { filters, menuProps } = filterPanelConfig
  const filtersWithDefaults = useMemo(
    () =>
      filters.map(filter => ({
        ...defaultRefinementProps(filter.attribute, searchType, t),
        ...filter
      })),
    [filters, searchType, t]
  )
  const menuAttributes = menuProps?.attributes ?? []
  const virtualFilters = useMemo(() => {
    const items = new Set<string>()
    filtersWithDefaults.forEach(({ attribute }) => items.add(attribute))
    menuAttributes.forEach(attribute => {
      if (attribute) items.add(attribute)
    })
    return Array.from(items)
  }, [filtersWithDefaults, menuAttributes])

  const searchClient = useMemo(
    () =>
      new TypesenseInstantSearchAdapter({
        server: getServerConfig(),
        additionalSearchParameters: searchParameters
      }).searchClient,
    [searchParameters]
  )

  return (
    <SearchErrorBoundary>
      <InstantSearch
        indexName={sortByItems[0].value}
        initialUiState={initialUiState}
        searchClient={searchClient}
        routing={{
          router: createInstantSearchRouterNext({
            singletonRouter,
            routerOptions: {
              cleanUrlOnDispose: false,
              createURL: searchStateToUrl,
              parseURL: pathToSearchState
            }
          })
        }}
        future={{ preserveSharedStateOnUnmount: true }}
      >
        <VirtualRefinements attributes={virtualFilters} />
        {header}
        <RefinementPanel menuProps={menuProps} filters={filtersWithDefaults}>
          {({ filterPanel, filterToggle }) => (
            <SearchContainer>
              <Row>
                <Col xs={12}>
                  <SearchBox
                    placeholder={t(`search_box.placeholder.${searchType}`)}
                    className="mt-2 mb-3"
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={12} lg={3} className="mb-3 mb-lg-0">
                  {filterPanel}
                </Col>
                <Col className="d-flex flex-column">
                  <RefinementToolbar>
                    <ResultCount className="flex-grow-1 m-1" />
                    <SortBy items={sortByItems} />
                    {filterToggle}
                  </RefinementToolbar>
                  <CurrentRefinements
                    className="mt-2 mb-2"
                    {...currentRefinementsProps}
                  />
                  <ResultsPane hitComponent={hitComponent} />
                  <Pagination className="mx-auto mt-2 mb-3" />
                </Col>
              </Row>
            </SearchContainer>
          )}
        </RefinementPanel>
      </InstantSearch>
    </SearchErrorBoundary>
  )
}
