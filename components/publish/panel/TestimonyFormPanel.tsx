import { useEffect } from "react"
import { useAuth } from "../../auth"
import { Bill } from "../../db"
import { useAppDispatch } from "../../hooks"
import { resolveBill, usePanelStatus } from "../hooks"
import {
  CompleteTestimony,
  CreateTestimony,
  PendingUpgrade,
  SignedOut,
  UnverifiedEmail
} from "./ctas"
import { ThankYouModal } from "./ThankYouModal"
import { YourTestimony } from "./YourTestimony"
import { useMediaQuery } from "usehooks-ts"

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
//create testimony ln 43. make a ternary same with
const Panel = () => {
  //tempory check for isMobile to hide create/CompleteTestimony on mobile view
  const isMobile = useMediaQuery("(max-width: 768px)")
  const status = usePanelStatus()
  console.log({ status })
  // // TODO: remove
  // return <CreateTestimony />

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
    case "pendingUpgrade":
      return <PendingUpgrade />
    default:
      return <YourTestimony />
  }
}
