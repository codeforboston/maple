import AwesomeDebouncePromise from "awesome-debounce-promise"
import { useEffect, useMemo, useState } from "react"
import { GroupBase } from "react-select"
import AsyncSelect, { AsyncProps } from "react-select/async"
import { Col, Form, Row } from "../bootstrap"
import { FilterOptions, SortOptions, FilterType } from "../db"
import { formatBillId } from "../formatting"
import { SearchService, useServiceChecked } from "./service"

type SetSort = (sort: SortOptions) => void
type SetFilter = (filter: FilterOptions | null) => void
type SetFilterType = (filterType: FilterType | null) => void

export const Search: React.FC<{
  setSort: SetSort
  setFilter: SetFilter
}> = ({ setSort, setFilter }) => {
  const [filterType, setFilterType] = useState<null | FilterType>(null)

  return (
    <Form>
      <Row>
        <SortSelect setSort={setSort} />
        <SearchTypeSelect setFilterType={setFilterType} />
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
          const filterType = option === "none" ? null : (option as FilterType)
          setFilterType(filterType)
        }}
      >
        <option value="none">None</option>
        <option value="bill">Bill Content</option>
        <option value="primarySponsor">Lead Sponsor</option>
        <option value="committee">Current Committee</option>
        <option value="city">City</option>
      </Form.Select>
    </Form.Group>
  )
}

const SearchBox: React.FC<{
  filterType: FilterType | null
  setFilter: SetFilter
}> = ({ filterType, setFilter }) => {
  const search = useServiceChecked()

  return filterType ? (
    <ItemSearch
      key={filterType}
      {...getItemSearchProps(search, filterType)}
      search={search}
      setFilter={setFilter}
    />
  ) : null
}

function getItemSearchProps(
  search: SearchService,
  filterType: FilterType
): FilterProps<any> {
  switch (filterType) {
    case "bill":
      return asProps({
        placeholder: "Search for bills...",
        getOptionLabel: o =>
          [formatBillId(o.id), o.title, o.pinslip].filter(Boolean).join(" | "),
        getOptionValue: o => o.id,
        getFilterOption: i => ({ type: "bill", id: i.id }),
        loadOptions: search.bills
      })
    case "city":
      return asProps({
        placeholder: "Search for cities...",
        getOptionLabel: o => o.name,
        getOptionValue: o => o.name,
        getFilterOption: i => ({ type: "city", name: i.name }),
        loadOptions: search.cities
      })
    case "committee":
      return asProps({
        placeholder: "Search for committees...",
        getOptionLabel: o => `${o.id} | ${o.name}`,
        getOptionValue: o => o.id,
        getFilterOption: i => ({ type: "committee", id: i.id }),
        loadOptions: search.committees
      })
    case "primarySponsor":
      return asProps({
        placeholder: "Search for lead sponsors...",
        getOptionLabel: o => `${o.name}${o.district ? ` | ${o.district}` : ""}`,
        getOptionValue: o => o.id,
        getFilterOption: i => ({ type: "primarySponsor", id: i.id }),
        loadOptions: search.members
      })
  }
}

type FilterProps<T> = Pick<
  ItemSearchProps<T>,
  | "placeholder"
  | "getOptionLabel"
  | "getOptionValue"
  | "getFilterOption"
  | "loadOptions"
>
const asProps = <T,>(props: FilterProps<T>) => props

type ItemSearchProps<T> = AsyncProps<T, false, GroupBase<T>> & {
  loadOptions: (value: string) => Promise<T[]>
  getFilterOption: (i: T) => FilterOptions
  setFilter: SetFilter
  search: SearchService
}

function ItemSearch<T>({
  loadOptions,
  getFilterOption,
  setFilter,
  search,
  ...props
}: ItemSearchProps<T>) {
  const error = useInitializeSearch(search)
  const debouncedLoadOptions = useMemo(
    () =>
      AwesomeDebouncePromise(async (value: string) => loadOptions(value), 100),
    [loadOptions]
  )
  return (
    <div className="mb-3">
      <AsyncSelect
        {...props}
        isClearable
        defaultOptions
        blurInputOnSelect
        loadOptions={debouncedLoadOptions}
        onChange={i => setFilter(i ? getFilterOption(i) : null)}
      />
      {error && (
        <Form.Text className="text-danger">
          Search error. Please try again.
        </Form.Text>
      )}
    </div>
  )
}

function useInitializeSearch(search: SearchService) {
  const [error, setError] = useState(false)

  useEffect(
    () =>
      void search
        .initialize()
        .then(() => {
          setError(false)
        })
        .catch(e => {
          console.warn("Error initializing search", e)
          setError(true)
        }),
    [search]
  )

  return error
}
