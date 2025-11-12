import { Trans, useTranslation } from "next-i18next"
import { useProfileState } from "../db/profile/redux"
import { Loading } from "../legislatorSearch"
import { External } from "../links"
import { SelectLegislators } from "../ProfilePage/SelectLegislators"
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
  return loading ? (
    <Loading />
  ) : (
    <div className={className}>
      <StepHeader>
        {t("submitTestimonyForm.selectLegislators.title")}
      </StepHeader>
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
      <nav.FormNavigation left={<nav.Previous />} right={<nav.Next />} />
    </div>
  )
}
