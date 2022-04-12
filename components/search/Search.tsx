import AwesomeDebouncePromise from "awesome-debounce-promise"
import { useCallback, useMemo, useState } from "react"
import { GroupBase } from "react-select"
import AsyncSelect, { AsyncProps } from "react-select/async"
import { Col, Form, Row } from "../bootstrap"
import { FilterOptions, SortOptions, TestimonyFilterOptions } from "../db"
import { formatBillId } from "../formatting"
import { SearchService, useServiceChecked } from "./service"

type FilterType =
  | "billId"
  | "billText"
  | "primarySponsor"
  | "committee"
  | "city"
type SetSort = (sort: SortOptions) => void
type SetFilter<T> = (filter: T | null) => void
type SetFilterType = (filterType: FilterType | null) => void

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

export const TestimonySearch: React.FC<{
  setFilter: SetFilter<TestimonyFilterOptions>
}> = ({ setFilter }) => {
  const search = useServiceChecked()
  return (
    <ItemSearch
      placeholder="Type to search for legislators..."
      getOptionLabel={o => `${o.name}${o.district ? ` | ${o.district}` : ""}`}
      getOptionValue={o => o.id}
      getFilterOption={i =>
        i.branch === "House" ? { representativeId: i.id } : { senatorId: i.id }
      }
      loadOptions={search.members}
      setFilter={setFilter}
    />
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
      {...getBillSearchProps(search, filterType)}
      setFilter={setFilter}
    />
  ) : null
}

function getBillSearchProps(
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
        loadOptions: search.billIds
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

type FilterProps<T, F> = Pick<
  ItemSearchProps<T, F>,
  | "placeholder"
  | "getOptionLabel"
  | "getOptionValue"
  | "getFilterOption"
  | "loadOptions"
>
const asProps = <T, F>(props: FilterProps<T, F>) => props

type LoadOptions<T> = (value: string) => Promise<T[]>
type ItemSearchProps<T, F> = AsyncProps<T, false, GroupBase<T>> & {
  loadOptions: LoadOptions<T>
  getFilterOption: (i: T) => F
  setFilter: SetFilter<F>
}

function ItemSearch<T, F>({
  loadOptions,
  getFilterOption,
  setFilter,
  ...props
}: ItemSearchProps<T, F>) {
  const { debouncedLoadOptions, error } = useDebouncedLoadOptions(loadOptions)
  const { defaults, loadDefaults, loading } = useDefaultOptions(loadOptions)
  return (
    <div className="mb-3">
      <AsyncSelect
        {...props}
        instanceId="item-search"
        isClearable
        onFocus={loadDefaults}
        defaultOptions={defaults}
        isLoading={loading ? true : undefined}
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

const useDebouncedLoadOptions = <T,>(loadOptions: LoadOptions<T>) => {
  const [error, setError] = useState(false)
  const debouncedLoadOptions = useMemo(
    () =>
      AwesomeDebouncePromise(async (value: string) => {
        try {
          const options = await loadOptions(value)
          setError(false)
          return options
        } catch (e) {
          console.warn("Search error", e)
          setError(true)
        }
      }, 100),
    [loadOptions]
  )
  return { error, debouncedLoadOptions }
}

const useDefaultOptions = <T,>(loadOptions: LoadOptions<T>) => {
  const [defaults, setDefaults] = useState<any>(undefined)
  const [loading, setLoadingDefaults] = useState(false)
  const loadDefaults = useCallback(() => {
    if (!defaults && !loading) {
      setLoadingDefaults(true)
      loadOptions("")
        .then(options => {
          setLoadingDefaults(false)
          setDefaults(options)
        })
        .catch(e => {
          console.warn("Search defaults error", e)
          setLoadingDefaults(false)
        })
    }
  }, [defaults, loadOptions, loading])
  return { loadDefaults, loading, defaults }
}
