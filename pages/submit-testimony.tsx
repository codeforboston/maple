import { useRouter } from "next/router"
import { useEffect } from "react"
import { requireAuth } from "../components/auth"
import { useAppDispatch } from "../components/hooks"
import { createPage } from "../components/page"
import { resolvePublicationInfo } from "../components/publish/hooks"
import { setStep, Step, usePublishState } from "../components/publish/redux"
import { SubmitTestimonyForm } from "../components/publish/SubmitTestimonyForm"

export default createPage({
  title: "Submit Testimony",
  Page: requireAuth(({ user }) => {
    const initialized = useUrlConfiguration(user.uid)

    return initialized ? <SubmitTestimonyForm /> : null
  })
})

const stringOrNull = (s: any) => (typeof s === "string" ? s : null)

const useUrlConfiguration = (authorUid: string) => {
  const router = useRouter(),
    billId = stringOrNull(router.query.billId),
    step = stringOrNull(router.query.step),
    dispatch = useAppDispatch()
  const { step: currentStep, bill } = usePublishState()
  const initialized = Boolean(bill && currentStep)

  useEffect(() => {
    if (billId) dispatch(resolvePublicationInfo({ billId, authorUid }))
  }, [authorUid, billId, dispatch])

  useEffect(() => {
    if (step && !currentStep) {
      dispatch(setStep(step as Step))
    }
  }, [currentStep, dispatch, step])

  useEffect(() => {
    if (currentStep !== step) {
      router.push(`?billId=${billId}&step=${currentStep}`)
    }
  }, [billId, currentStep, router, step])

  return initialized
}

// does a bunch of stuff, syncs up the step in the URL with the step in the form.
function useTestimonyRouting() {}
