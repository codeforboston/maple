import { useEffect, useState } from "react"
import { useProfileState } from "../db/profile/redux"
import { useAppDispatch } from "../hooks"
import { Loading } from "../legislatorSearch"
import { External } from "../links"
import { SelectLegislators } from "../ProfilePage/SelectLegislators"
import * as nav from "./NavigationButtons"
import { nextStep } from "./redux"
import { StepHeader } from "./StepHeader"

export const SelectLegislatorsCta = ({ className }: { className?: string }) => {
  const { profile: { representative, senator } = {}, loading } =
    useProfileState()
  const dispatch = useAppDispatch()
  const [state, setState] = useState<
    "loading" | "missingLegislators" | "alreadySelected"
  >("loading")

  useEffect(() => {
    if (state === "loading" && !loading) {
      if (representative && senator) setState("alreadySelected")
      else setState("missingLegislators")
    }
  }, [dispatch, loading, representative, senator, state])

  useEffect(() => {
    if (state === "alreadySelected") {
      dispatch(nextStep())
    }
  }, [dispatch, state])

  if (state === "loading") {
    return <Loading />
  } else if (state === "missingLegislators") {
    return (
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
        <nav.FormNavigation right={<nav.Next />} />
      </div>
    )
  } else {
    return null
  }
}
