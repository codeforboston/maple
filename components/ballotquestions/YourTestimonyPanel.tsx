import { useTranslation } from "next-i18next"
import { BallotQuestion, Bill } from "../db"
import { TestimonyFormPanel } from "../publish/panel/TestimonyFormPanel"
import { EditTestimonyButton } from "../publish/panel/EditTestimonyButton"
import {
  isActiveBallotQuestionPhase,
  isTerminalBallotQuestionPhase
} from "./status"
import { usePanelStatus, usePublishState } from "../publish/hooks"

export const YourTestimonyPanel = ({
  ballotQuestion,
  bill
}: {
  ballotQuestion: BallotQuestion
  bill: Bill | null
}) => {
  const { t } = useTranslation("ballotquestions")
  const isActivePhase = isActiveBallotQuestionPhase(ballotQuestion.ballotStatus)
  const isTerminalPhase = isTerminalBallotQuestionPhase(
    ballotQuestion.ballotStatus
  )
  const panelStatus = usePanelStatus()
  const { bill: resolvedBill, ballotQuestionId: resolvedBallotQuestionId } =
    usePublishState()
  const showInlineEditButton =
    isActivePhase &&
    !!bill &&
    resolvedBill?.id === bill.id &&
    resolvedBallotQuestionId === ballotQuestion.id &&
    (panelStatus === "published" || panelStatus === "editInProgress")

  return (
    <div className="h-100">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="maple-panel-title">{t("yourPerspective.title")}</div>
        {showInlineEditButton && bill ? (
          <EditTestimonyButton
            billId={bill.id}
            court={bill.court}
            ballotQuestionId={ballotQuestion.id}
          />
        ) : null}
      </div>
      {isActivePhase && bill ? (
        <>
          <TestimonyFormPanel
            bill={bill}
            ballotQuestionId={ballotQuestion.id}
            variant="ballotQuestion"
          />
        </>
      ) : isTerminalPhase ? (
        <div className="maple-info-note rounded px-3 py-3 small">
          {t("yourPerspective.closed")}
        </div>
      ) : (
        <div className="maple-info-note rounded px-3 py-3 small">
          {t("yourPerspective.notAvailable")}
        </div>
      )}
    </div>
  )
}
