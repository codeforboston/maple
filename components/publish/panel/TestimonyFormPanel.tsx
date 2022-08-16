import { useEffect } from "react"
import { useAuth } from "../../auth"
import { Bill } from "../../db"
import { useAppDispatch } from "../../hooks"
import { resolvePublicationInfo } from "../hooks"
import { setStep } from "../redux"
import { CreateTestimony, SignedOut } from "./ctas"
import { usePanelStatus } from "./hooks"
import { ThankYouModal } from "./ThankYouModal"
import { YourTestimony } from "./YourTestimony"

export const TestimonyFormPanel = ({ bill }: { bill: Bill }) => {
  const dispatch = useAppDispatch()
  const authorUid = useAuth().user?.uid
  useEffect(() => {
    if (authorUid) {
      dispatch(resolvePublicationInfo({ authorUid, bill }))
    }
  }, [authorUid, bill, dispatch])
  // TODO: set step smarterly
  useEffect(() => {
    dispatch(setStep("position"))
  }, [dispatch])
  return (
    <>
      <ThankYouModal />
      <Panel />
    </>
  )
}

const Panel = () => {
  const status = usePanelStatus()
  switch (status) {
    case "signedOut":
      return <SignedOut />
    case "noTestimony":
      return <CreateTestimony />
    default:
      return <YourTestimony />
  }
}
