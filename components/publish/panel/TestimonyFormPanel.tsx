import { useEffect } from "react"
import { useAuth } from "../../auth"
import { Bill } from "../../db"
import { useAppDispatch } from "../../hooks"
import { resolveBill, usePanelStatus } from "../hooks"
import { CompleteTestimony, CreateTestimony, SignedOut } from "./ctas"
import { ThankYouModal } from "./ThankYouModal"
import { YourTestimony } from "./YourTestimony"

export const TestimonyFormPanel = ({ bill }: { bill: Bill }) => {
  const dispatch = useAppDispatch()
  const authorUid = useAuth().user?.uid
  useEffect(() => {
    dispatch(resolveBill({ bill }))
  }, [authorUid, bill, dispatch])
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
    case "loading":
      return null
    case "signedOut":
      return <SignedOut />
    case "noTestimony":
      return <CreateTestimony />
    case "createInProgress":
      return <CompleteTestimony />
    default:
      return <YourTestimony />
  }
}
