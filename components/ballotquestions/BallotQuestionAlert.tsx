import { useTranslation } from "next-i18next"
import ReactMarkdown from "react-markdown"
import { QuestionTooltip } from "../tooltip"

export function BallotQuestionAlert({
  alertFlag,
  alertTip
}: {
  alertFlag: string | null
  alertTip?: string | null
}) {
  const { t } = useTranslation("ballotquestions")

  if (!alertFlag) return null

  return (
    <aside
      className="ballot-question-alert d-flex align-items-center gap-3 rounded-4 px-3 py-3"
      aria-label={t("alert.ariaLabel")}
    >
      <span className="ballot-question-alert-icon" aria-hidden="true">
        !
      </span>
      <div className="ballot-question-alert-content">
        <ReactMarkdown
          components={{
            a: ({ node: _node, ...props }) => (
              <a {...props} target="_blank" rel="noopener noreferrer" />
            ),
            p: ({ node: _node, ...props }) => (
              <span {...props}>
                {props.children}
                {alertTip && <QuestionTooltip text={alertTip} />}
              </span>
            )
          }}
        >
          {alertFlag}
        </ReactMarkdown>
      </div>
    </aside>
  )
}
