import {
  CurrentRefinements,
  Hits,
  InstantSearch,
  Pagination,
  SearchBox
} from "@alexjball/react-instantsearch-hooks-web"
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter"
import { Col, Row } from "../bootstrap"
import { BillHit } from "./BillHit"
import { getServerConfig, SatelliteCustomization } from "./common"
import { useRefinements } from "./useRefinements"

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: getServerConfig(),
  additionalSearchParameters: {
    query_by: "number,title,body",
    exclude_fields: "body"
  }
})

const searchClient = typesenseInstantsearchAdapter.searchClient

export const BillSearch = () => (
  <InstantSearch indexName="bills" searchClient={searchClient} routing>
    <SearchLayout />
  </InstantSearch>
)

const SearchLayout = () => {
  const refinements = useRefinements()
  return (
    <SatelliteCustomization>
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
          <Hits hitComponent={BillHit} />
          <Pagination className="mx-auto mt-2 mb-3" />
        </Col>
      </Row>
    </SatelliteCustomization>
  )
}
