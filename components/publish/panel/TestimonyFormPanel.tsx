import { useEffect } from "react"
import { useAuth } from "../../auth"
import { Bill } from "../../db"
import { useAppDispatch } from "../../hooks"
import { resolveBill, usePanelStatus } from "../hooks"
import {
  CompleteTestimony,
  CreateTestimony,
  SignedOut,
  UnverifiedEmail
} from "./ctas"
import { ThankYouModal } from "./ThankYouModal"
import { YourTestimony } from "./YourTestimony"

export const TestimonyFormPanel = ({ bill }: { bill: Bill }) => {
  const dispatch = useAppDispatch()
  const authorUid = useAuth().user?.uid
  useEffect(() => {
    dispatch(resolveBill({ bill }))
  }, [authorUid, bill, dispatch])
  return (
    <div className="mt-4">
      <ThankYouModal />
      <Panel />
    </div>
  )
}

const Panel = () => {
  const status = usePanelStatus()
  switch (status) {
    case "loading":
      return null
    case "signedOut":
      return <SignedOut />
    case "unverified":
      return <UnverifiedEmail />
    case "noTestimony":
      return <CreateTestimony />
    case "createInProgress":
      return <CompleteTestimony />
    default:
      return <YourTestimony />
  }
}
