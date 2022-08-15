import { useEffect } from "react"
import styled from "styled-components"
import { useAuth } from "../auth"
import { Bill } from "../db"
import { useAppDispatch } from "../hooks"
import { CreateTestimony, FinishTestimony, SignedOut } from "./ctas"
import { resolvePublicationInfo, usePanelStatus } from "./hooks"
import { setStep } from "./redux"
import { ThankYouModal } from "./ThankYouModal"

const Styled = styled.div`
  border-radius: 1rem;
  background: white;
  min-height: 25rem;
`

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
    case "createInProgress":
      return <FinishTestimony />
    case "published":
      return <Styled>Edit your existing testimony</Styled>
    case "editInProgress":
      return <Styled>Finish editing your existing testimony</Styled>
  }
}
