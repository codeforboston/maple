import { Form } from "../bootstrap"
import {
  MemberSearchIndex,
  ProfileHook,
  useMemberSearch,
  useProfile
} from "../db"
import { Loading, Search } from "../legislatorSearch"

export const SelectLegislators: React.FC = () => {
  const { index, loading: searchLoading } = useMemberSearch(),
    profile = useProfile(),
    loading = profile.loading || searchLoading

  return loading ? (
    <Loading />
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
      <Form.Group className="mb-4">
        <Form.Label>Representative</Form.Label>
        <Search
          placeholder="Search your representative"
          index={index.representatives}
          isLoading={profile.updatingRep}
          memberId={profile.profile?.representative?.id}
          update={profile.updateRep}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Senator</Form.Label>
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
