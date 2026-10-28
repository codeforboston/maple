import { Form } from "../bootstrap"
import {
  MemberSearchIndex,
  ProfileHook,
  useMemberSearch,
  useProfile
} from "../db"
import { Loading, Search } from "../legislatorSearch"
import { useTranslation } from "next-i18next"

type SelectLegislatorsProps = {
  index?: MemberSearchIndex
  profile?: ProfileHook
}

const SelectLegislatorsWithHooks = () => {
  const { index, loading: searchLoading } = useMemberSearch(),
    profile = useProfile(),
    loading = profile.loading || searchLoading

  return loading ? (
    <Loading />
  ) : (
    <LegislatorForm profile={profile} index={index!} />
  )
}

export const SelectLegislators: React.FC<
  React.PropsWithChildren<SelectLegislatorsProps>
> = ({ index, profile }) => {
  if (index && profile) {
    return <LegislatorForm profile={profile} index={index} />
  }

  return <SelectLegislatorsWithHooks />
}

/** The representative and senator pickers. Their menus open on a layer over
 * the page (react-select's menu portal), so a card with overflow hidden
 * around them cannot cut them off: above the page's content, below
 * Bootstrap's sticky navbar (1020), and in Lexend, since the layer sits
 * outside the page. The labels take a heading's size and weight (Bootstrap's
 * h6, so they stay labels) in Lexend rather than Bootstrap's heading Nunito. */
export const LegislatorForm: React.FC<
  React.PropsWithChildren<{
    index: MemberSearchIndex
    profile: ProfileHook
  }>
> = ({ index, profile }) => {
  const { t } = useTranslation("editProfile")
  const menuPortal = {
    menuPortalTarget: document.body,
    styles: {
      menuPortal: (base: object) => ({
        ...base,
        zIndex: 1000,
        fontFamily: "var(--maple-font-heading)"
      })
    }
  }
  const headingLabel = {
    className: "h6",
    style: { fontFamily: "var(--maple-font-heading)" }
  }

  return (
    <div>
      <Form.Group className="mb-4">
        <Form.Label {...headingLabel}>
          {t("legislator.representative")}
        </Form.Label>
        <Search
          placeholder={t("legislator.selectRepresentative")}
          index={index?.representatives}
          isLoading={profile.updatingRep}
          memberId={profile.profile?.representative?.id}
          update={profile.updateRep}
          {...menuPortal}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label {...headingLabel}>{t("legislator.senator")}</Form.Label>
        <Search
          placeholder={t("legislator.selectSenator")}
          index={index?.senators}
          isLoading={profile.updatingSenator}
          memberId={profile.profile?.senator?.id}
          update={profile.updateSenator}
          {...menuPortal}
        />
      </Form.Group>
    </div>
  )
}
