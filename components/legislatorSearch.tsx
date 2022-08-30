import AwesomeDebouncePromise from "awesome-debounce-promise"
import Fuse from "fuse.js"
import { useMemo } from "react"
import { GroupBase } from "react-select"
import AsyncSelect, { AsyncProps } from "react-select/async"
import { Row, Spinner } from "./bootstrap"
import { MemberSearchIndexItem, ProfileMember } from "./db"

export const Loading = () => (
  <Row>
    <Spinner animation="border" className="mx-auto" />
  </Row>
)

export type BaseProps<
  T extends MemberSearchIndexItem,
  IsMulti extends boolean
> = AsyncProps<T, IsMulti, GroupBase<T>>

export type SearchProps = {
  index: MemberSearchIndexItem[]
  update: (member: ProfileMember | null) => void
  memberId: string | undefined
} & BaseProps<MemberSearchIndexItem, false>

export type MultiSearchProps<T extends MemberSearchIndexItem> = {
  index: T[]
  update: (members: T[]) => void
  memberIds: string[]
} & BaseProps<T, true>

export const Search = ({ index, update, memberId, ...props }: SearchProps) => {
  const { byId, baseProps } = useSearch(false, index)
  return (
    <AsyncSelect
      value={memberId === undefined ? undefined : byId[memberId]}
      onChange={value => {
        if (value) {
          update({
            id: value.MemberCode,
            district: value.District,
            name: value.Name
          })
        } else {
          update(null)
        }
      }}
      {...baseProps}
      {...props}
    />
  )
}

export const MultiSearch = <T extends MemberSearchIndexItem>({
  index,
  update,
  memberIds,
  ...props
}: MultiSearchProps<T>) => {
  const { byId, baseProps } = useSearch(true, index)
  return (
    <AsyncSelect
      value={memberIds.map(id => byId[id])}
      onChange={value => update([...value])}
      {...baseProps}
      {...props}
    />
  )
}

const useSearch = <T extends MemberSearchIndexItem, M extends boolean>(
  isMulti: M,
  index: T[]
) => {
  const byId = useMemo(
    () => Object.fromEntries(index.map(m => [m.MemberCode, m])),
    [index]
  )

  const fuse = useMemo(
    () =>
      new Fuse(index, {
        keys: [
          { name: "Name", weight: 2 },
          { name: "District", weight: 1 },
          { name: "EmailAddress", weight: 0.5 },
          { name: "MemberCode", weight: 0.5 }
        ]
      }),
    [index]
  )

  const loadOptions = useMemo(
    () =>
      AwesomeDebouncePromise(async (value: string) => {
        return fuse
          .search(value, { limit: 10 })
          .map(({ refIndex }) => index[refIndex])
      }, 100),
    [fuse, index]
  )

  return useMemo(() => {
    const baseProps: BaseProps<T, M> = {
      isMulti,
      loadOptions,
      classNamePrefix: "leg-search",
      isClearable: true,
      defaultOptions: index,
      getOptionLabel: o => `${o.Name} | ${o.District}`,
      getOptionValue: o => o.MemberCode,
      theme: theme => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary25: "var(--bs-blue-100)",
          primary50: "var(--bs-blue-300)",
          primary75: "var(--bs-blue-400)",
          primary: "var(--bs-blue)",
          danger: "var(--bs-red)",
          dangerLight: "var(--bs-red-100)"
        }
      })
    }

    return { byId, baseProps }
  }, [byId, index, isMulti, loadOptions])
}
