import { TestimonyFilterOptions } from "../db"
import { ItemSearch, SetFilter } from "./search"
import { useServiceChecked } from "./service"

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
