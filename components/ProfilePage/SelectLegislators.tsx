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
  /** Open the search menus on a layer over the page (react-select's menu
   * portal), so a card with overflow hidden around them cannot cut them off.
   * Edit Profile's legislators card uses it. Off by default. */
  portalMenu?: boolean
  /** "Select your representative" rather than "Search your representative"
   * (and the same for the senator). Edit Profile uses it. Off by default. */
  selectWording?: boolean
  /** The Representative and Senator labels set as h6 (Bootstrap's class, so
   * they stay labels). Edit Profile uses it. Off by default. */
  headingLabels?: boolean
}

const SelectLegislatorsWithHooks = ({
  portalMenu,
  selectWording,
  headingLabels
}: Pick<
  SelectLegislatorsProps,
  "portalMenu" | "selectWording" | "headingLabels"
>) => {
  const { index, loading: searchLoading } = useMemberSearch(),
    profile = useProfile(),
    loading = profile.loading || searchLoading

  return loading ? (
    <Loading />
  ) : (
    <LegislatorForm
      profile={profile}
      index={index!}
      portalMenu={portalMenu}
      selectWording={selectWording}
      headingLabels={headingLabels}
    />
  )
}

export const SelectLegislators: React.FC<
  React.PropsWithChildren<SelectLegislatorsProps>
> = ({ index, profile, portalMenu, selectWording, headingLabels }) => {
  if (index && profile) {
    return (
      <LegislatorForm
        profile={profile}
        index={index}
        portalMenu={portalMenu}
        selectWording={selectWording}
        headingLabels={headingLabels}
      />
    )
  }

  return (
    <SelectLegislatorsWithHooks
      portalMenu={portalMenu}
      selectWording={selectWording}
      headingLabels={headingLabels}
    />
  )
}

export const LegislatorForm: React.FC<
  React.PropsWithChildren<{
    index: MemberSearchIndex
    profile: ProfileHook
    portalMenu?: boolean
    selectWording?: boolean
    headingLabels?: boolean
  }>
> = ({ index, profile, portalMenu, selectWording, headingLabels }) => {
  const { t } = useTranslation("editProfile")
  // Above the page's content, below Bootstrap's sticky navbar (1020). The
  // layer sits outside the page, so it takes the skin's face (Lexend) itself.
  const menuPortal = portalMenu
    ? {
        menuPortalTarget: document.body,
        styles: {
          menuPortal: (base: object) => ({
            ...base,
            zIndex: 1000,
            fontFamily: "var(--maple-font-heading)"
          })
        }
      }
    : {}
  // A heading's size and weight (Bootstrap's h6), in the skin's heading face
  // (Lexend) rather than Bootstrap's heading Nunito, wherever the picker is.
  const headingLabel = headingLabels
    ? {
        className: "h6",
        style: { fontFamily: "var(--maple-font-heading)" }
      }
    : {}

  return (
    <div>
      <Form.Group className="mb-4">
        <Form.Label {...headingLabel}>
          {t("legislator.representative")}
        </Form.Label>
        <Search
          placeholder={t(
            selectWording
              ? "legislator.selectRepresentative"
              : "legislator.searchRepresentative"
          )}
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
          placeholder={t(
            selectWording
              ? "legislator.selectSenator"
              : "legislator.searchSenator"
          )}
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
