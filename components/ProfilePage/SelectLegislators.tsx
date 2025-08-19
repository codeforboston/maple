import { Form } from "../bootstrap"
import {
  MemberSearchIndex,
  ProfileHook,
  useMemberSearch,
  useProfile
} from "../db"
import { Loading, Search } from "../legislatorSearch"
import { useTranslation } from "next-i18next"

export const SelectLegislators: React.FC<
  React.PropsWithChildren<unknown>
> = () => {
  const { index, loading: searchLoading } = useMemberSearch(),
    profile = useProfile(),
    loading = profile.loading || searchLoading

  return loading ? (
    <Loading />
  ) : (
    <LegislatorForm profile={profile} index={index!} />
  )
}

export const LegislatorForm: React.FC<
  React.PropsWithChildren<{
    index: MemberSearchIndex
    profile: ProfileHook
  }>
> = ({ index, profile }) => {
  const { t } = useTranslation("editProfile")

  return (
    <div>
      <Form.Group className="mb-4">
        <Form.Label>{t("legislator.representative")}</Form.Label>
        <Search
          placeholder={t("legislator.searchRepresentative")}
          index={index?.representatives}
          isLoading={profile.updatingRep}
          memberId={profile.profile?.representative?.id}
          update={profile.updateRep}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>{t("legislator.senator")}</Form.Label>
        <Search
          placeholder={t("legislator.searchSenator")}
          index={index?.senators}
          isLoading={profile.updatingSenator}
          memberId={profile.profile?.senator?.id}
          update={profile.updateSenator}
        />
      </Form.Group>
    </div>
  )
}
