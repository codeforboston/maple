import { Trans, useTranslation } from "next-i18next"
import { useProfileState } from "../db/profile/redux"
import { Loading } from "../legislatorSearch"
import { External } from "../links"
import { SelectLegislators } from "../ProfilePage/SelectLegislators"
import { useHtmlAttribute } from "components/shared/useHtmlAttribute"
import { TitledSectionCard } from "components/shared"
import { useFormRedirection } from "./hooks"
import * as nav from "./NavigationButtons"
import { StepHeader } from "./StepHeader"

function useSelectLegislators() {
  const { loading } = useProfileState()
  useFormRedirection()
  return loading
}

export const SelectLegislatorsCta = ({ className }: { className?: string }) => {
  const { t } = useTranslation("testimony")
  const loading = useSelectLegislators()
  // Digital Democracy skins: a titled card holding the picker set as Edit
  // Profile's is (EditProfilePage/YourLegislators.tsx). Maple keeps main's.
  const dd = useHtmlAttribute("data-maple-theme") === "dd"
  const description = (
    <p>
      <Trans
        t={t}
        i18nKey="submitTestimonyForm.selectLegislators.description"
        components={[
          // eslint-disable-next-line react/jsx-key
          <External href="https://malegislature.gov/Search/FindMyLegislator" />
        ]}
      />
    </p>
  )
  return loading ? (
    <Loading />
  ) : (
    <div className={className}>
      {dd ? (
        // A card with its title in the band, as Edit Profile's legislators
        // card is (EditProfilePage/PersonalInfoTab.tsx).
        <TitledSectionCard
          title={t("submitTestimonyForm.selectLegislators.title")}
          className="mb-4 publish-card"
        >
          {description}
          <SelectLegislators portalMenu selectWording headingLabels />
        </TitledSectionCard>
      ) : (
        <>
          <StepHeader>
            {t("submitTestimonyForm.selectLegislators.title")}
          </StepHeader>
          {description}
          <SelectLegislators />
        </>
      )}
      <nav.FormNavigation left={<nav.Previous />} right={<nav.Next />} />
    </div>
  )
}
