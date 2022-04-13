import { useCallback, useState } from "react"
import { Col, Form, Row } from "../bootstrap"
import { FilterOptions, SortOptions } from "../db"
import { formatBillId } from "../formatting"
import { ItemSearch, ItemSearchProps, SetFilter } from "./search"
import { SearchService, useServiceChecked } from "./service"

type FilterType =
  | "billId"
  | "billText"
  | "primarySponsor"
  | "committee"
  | "city"
type SetSort = (sort: SortOptions) => void
type SetFilterType = (filterType: FilterType | null) => void
type FilterProps<T, F> = Pick<
  ItemSearchProps<T, F>,
  | "placeholder"
  | "getOptionLabel"
  | "getOptionValue"
  | "getFilterOption"
  | "loadOptions"
>

/** Helper for inferring type parameters of props */
const asProps = <T, F>(props: FilterProps<T, F>) => props

export const BillSearch: React.FC<{
  setSort: SetSort
  setFilter: SetFilter<FilterOptions>
}> = ({ setSort, setFilter }) => {
  const [filterType, setFilterType] = useState<null | FilterType>("billId")
  const onFilterTypeChange: SetFilterType = useCallback(
    t => {
      setFilterType(t)
      setFilter(null)
    },
    [setFilter]
  )

  return (
    <Form>
      <Row>
        <SearchTypeSelect setFilterType={onFilterTypeChange} />
        <SortSelect setSort={setSort} />
      </Row>
      <Row>
        <SearchBox filterType={filterType} setFilter={setFilter} />
      </Row>
    </Form>
  )
}

const SortSelect: React.FC<{ setSort: SetSort }> = ({ setSort }) => {
  return (
    <Form.Group as={Col} md={4} controlId="billSearchSort" className="mb-3">
      <Form.Label>Sort by</Form.Label>
      <Form.Select
        onChange={e => {
          setSort(e.target.value as SortOptions)
        }}
      >
        <option value="id">Bill #</option>
        <option value="cosponsorCount"># CoSponsors</option>
        <option value="testimonyCount"># Testimony</option>
        <option value="hearingDate">Next Hearing Date</option>
        <option value="latestTestimony">Most recent testimony</option>
      </Form.Select>
    </Form.Group>
  )
}

const SearchTypeSelect: React.FC<{ setFilterType: SetFilterType }> = ({
  setFilterType
}) => {
  return (
    <Form.Group as={Col} md={4} controlId="billSearchFilter" className="mb-3">
      <Form.Label>Search by</Form.Label>
      <Form.Select
        onChange={e => {
          const option = e.target.value
          const filterType = option as FilterType
          setFilterType(filterType)
        }}
      >
        <option value="billId">Bill Number</option>
        <option value="billText">Bill Title</option>
        <option value="primarySponsor">Lead Sponsor</option>
        <option value="committee">Current Committee</option>
        <option value="city">City</option>
      </Form.Select>
    </Form.Group>
  )
}

const SearchBox: React.FC<{
  filterType: FilterType | null
  setFilter: SetFilter<FilterOptions>
}> = ({ filterType, setFilter }) => {
  const search = useServiceChecked()

  return filterType ? (
    <ItemSearch
      key={filterType}
      {...getSearchProps(search, filterType)}
      setFilter={setFilter}
    />
  ) : null
}

function getSearchProps(
  search: SearchService,
  filterType: FilterType
): FilterProps<any, any> {
  switch (filterType) {
    case "billId":
      return asProps({
        placeholder: "Type to search for bills by number...",
        getOptionLabel: o =>
          [formatBillId(o.id), o.title].filter(Boolean).join(" | "),
        getOptionValue: o => o.id,
        getFilterOption: i => ({ type: "bill", id: i.id }),
        loadOptions: (q: string) => search.billIds(q.replace(/\.| /g, ""))
      })
    case "billText":
      return asProps({
        placeholder: "Type to search for bills by title...",
        getOptionLabel: o =>
          [formatBillId(o.id), o.title, o.pinslip].filter(Boolean).join(" | "),
        getOptionValue: o => o.id,
        getFilterOption: i => ({ type: "bill", id: i.id }),
        loadOptions: search.billContents
      })
    case "city":
      return asProps({
        placeholder: "Type to search for cities...",
        getOptionLabel: o => o.name,
        getOptionValue: o => o.name,
        getFilterOption: i => ({ type: "city", name: i.name }),
        loadOptions: search.cities
      })
    case "committee":
      return asProps({
        placeholder: "Type to search for committees...",
        getOptionLabel: o => `${o.id} | ${o.name}`,
        getOptionValue: o => o.id,
        getFilterOption: i => ({ type: "committee", id: i.id }),
        loadOptions: search.committees
      })
    case "primarySponsor":
      return asProps({
        placeholder: "Type to search for lead sponsors by name or district...",
        getOptionLabel: o => `${o.name}${o.district ? ` | ${o.district}` : ""}`,
        getOptionValue: o => o.id,
        getFilterOption: i => ({ type: "primarySponsor", id: i.id }),
        loadOptions: search.members
      })
  }
}
