import { Trans, useTranslation } from "next-i18next"
import { useProfileState } from "../db/profile/redux"
import { Loading } from "../legislatorSearch"
import { External } from "../links"
import { SelectLegislators } from "../ProfilePage/SelectLegislators"
import { TitledSectionCard } from "components/shared"
import { useFormRedirection } from "./hooks"
import * as nav from "./NavigationButtons"

function useSelectLegislators() {
  const { loading } = useProfileState()
  useFormRedirection()
  return loading
}

export const SelectLegislatorsCta = ({ className }: { className?: string }) => {
  const { t } = useTranslation("testimony")
  const loading = useSelectLegislators()
  return loading ? (
    <Loading />
  ) : (
    <div className={className}>
      {/* A card with its title in the band, as Edit Profile's legislators card
          is (EditProfilePage/PersonalInfoTab.tsx), holding the picker set as
          Edit Profile's is (EditProfilePage/YourLegislators.tsx). */}
      <TitledSectionCard
        title={t("submitTestimonyForm.selectLegislators.title")}
        className="mb-4 publish-card"
      >
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
        <SelectLegislators />
      </TitledSectionCard>
      <nav.FormNavigation left={<nav.Previous />} right={<nav.Next />} />
    </div>
  )
}
