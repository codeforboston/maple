import {
  MemberSearchIndex,
  MemberSearchIndexItem,
  Profile,
  ProfileHook,
  ProfileMember,
  useMemberSearch,
  useProfile
} from "./db"
import Fuse from "fuse.js"
import AsyncSelect, { AsyncProps } from "react-select/async"
import { GroupBase } from "react-select"
import { useMemo } from "react"
import { Row, Spinner, Form } from "./bootstrap"
import AwesomeDebouncePromise from "awesome-debounce-promise"

const SelectLegislators: React.FC = () => {
  const { index, loading: searchLoading } = useMemberSearch(),
    profile = useProfile(),
    loading = profile.loading || searchLoading

  return loading ? (
    <Row>
      <Spinner animation="border" className="mx-auto" />
    </Row>
  ) : (
    <LegislatorForm profile={profile} index={index!} />
  )
}

const LegislatorForm: React.FC<{
  index: MemberSearchIndex
  profile: ProfileHook
}> = ({ index, profile }) => {
  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.FloatingLabel label="Representative"></Form.FloatingLabel>
        <Search
          placeholder="Search your representative"
          index={index.representatives}
          isLoading={profile.updatingRep}
          memberId={profile.profile?.representative?.id}
          update={profile.updateRep}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.FloatingLabel label="Senator"></Form.FloatingLabel>
        <Search
          placeholder="Search your senator"
          index={index.senators}
          isLoading={profile.updatingSenator}
          memberId={profile.profile?.senator?.id}
          update={profile.updateSenator}
        />
      </Form.Group>
    </Form>
  )
}

type SearchProps = {
  index: MemberSearchIndexItem[]
  update: (member: ProfileMember) => void
  memberId: string | undefined
} & AsyncProps<MemberSearchIndexItem, false, GroupBase<MemberSearchIndexItem>>

const Search: React.FC<SearchProps> = ({
  index,
  update,
  memberId,
  ...props
}) => {
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

  return (
    <Row className="col-lg-8 mb-2">
      <AsyncSelect
        defaultOptions={index}
        getOptionLabel={o => `${o.Name} | ${o.District}`}
        getOptionValue={o => o.MemberCode}
        value={memberId === undefined ? undefined : byId[memberId]}
        onChange={value =>
          value &&
          update({
            id: value.MemberCode,
            district: value.District,
            name: value.Name
          })
        }
        loadOptions={loadOptions}
        {...props}
      />
    </Row>
  )
}

export default SelectLegislators
