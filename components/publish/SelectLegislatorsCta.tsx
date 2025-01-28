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
  const loading = useSelectLegislators()
  return loading ? (
    <Loading />
  ) : (
    <div className={className}>
      <StepHeader>Select Your Legislators</StepHeader>
      <p>
        It looks like you haven't selected your legislators. Please use the{" "}
        <External href="https://malegislature.gov/Search/FindMyLegislator">
          find your legislator tool
        </External>{" "}
        and select your State Representative and Senator below.
      </p>
      <SelectLegislators />
      <nav.FormNavigation left={<nav.Previous />} right={<nav.Next />} />
    </div>
  )
}
