import { useEffect } from "react"
import { useAuth } from "../../auth"
import { Spinner } from "../../bootstrap"
import { Bill } from "../../db"
import { useAppDispatch } from "../../hooks"
import { resolveBill, usePanelStatus } from "../hooks"
import {
  CompleteTestimony,
  CreateTestimony,
  PanelCtaVariant,
  PendingUpgrade,
  SignedOut,
  UnverifiedEmail
} from "./ctas"
import { ThankYouModal } from "./ThankYouModal"
import { YourTestimony } from "./YourTestimony"
import { useTranslation } from "next-i18next"

export const TestimonyFormPanel = ({
  bill,
  ballotQuestionId,
  variant = "default"
}: {
  bill: Bill
  ballotQuestionId?: string
  variant?: PanelCtaVariant
}) => {
  const dispatch = useAppDispatch()
  const authorUid = useAuth().user?.uid
  useEffect(() => {
    dispatch(resolveBill({ bill, ballotQuestionId }))
  }, [authorUid, bill, ballotQuestionId, dispatch])
  return (
    <div className={variant === "ballotQuestion" ? "mt-3" : "mt-4"}>
      <ThankYouModal />
      <Panel variant={variant} />
    </div>
  )
}

const Panel = ({ variant }: { variant: PanelCtaVariant }) => {
  const status = usePanelStatus()

  switch (status) {
    case "loading":
      return <LoadingPanel variant={variant} />
    case "signedOut":
      return <SignedOut variant={variant} />
    case "unverified":
      return <UnverifiedEmail variant={variant} />
    case "noTestimony":
      return <CreateTestimony variant={variant} />
    case "createInProgress":
      return <CompleteTestimony variant={variant} />
    case "pendingUpgrade":
      return <PendingUpgrade variant={variant} />
    default:
      return <YourTestimony variant={variant} />
  }
}

const LoadingPanel = ({ variant }: { variant: PanelCtaVariant }) => {
  const { t } = useTranslation("testimony")
  const loadingText =
    variant === "ballotQuestion"
      ? t("ballotQuestion.panel.loading")
      : t("panel.loading")

  return (
    <div
      className={
        variant === "ballotQuestion"
          ? "rounded border bg-light px-3 py-3 small text-body-secondary d-flex align-items-center gap-2"
          : "rounded border bg-light px-3 py-3 text-body-secondary d-flex align-items-center gap-2"
      }
    >
      <Spinner animation="border" size="sm" />
      <span>{loadingText}</span>
    </div>
  )
}
