import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"
import ReactMarkdown from "react-markdown"
import { QuestionTooltip } from "../tooltip"

/**
 * A ballot question flag. "warning" (the default, with "!") marks something
 * that may affect the question, such as a legal challenge; "info" (no icon)
 * is a standing note. Pass dismiss to give it a close button.
 */
export function BallotQuestionAlert({
  alertFlag,
  alertTip,
  variant = "warning",
  dismiss
}: {
  alertFlag: string | null
  alertTip?: string | null
  variant?: "warning" | "info"
  dismiss?: () => void
}) {
  const { t } = useTranslation("ballotquestions")

  if (!alertFlag) return null

  return (
    <aside
      className={`ballot-question-alert ${
        variant === "info" ? "ballot-question-alert--info" : ""
      } d-flex align-items-center gap-3 rounded-4 px-3 py-3`}
      aria-label={t(
        variant === "info" ? "alert.infoAriaLabel" : "alert.ariaLabel"
      )}
    >
      {variant !== "info" && (
        <span className="ballot-question-alert-icon" aria-hidden="true">
          !
        </span>
      )}
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
      {dismiss && (
        <button
          type="button"
          className="ballot-question-alert-close"
          aria-label={t("alert.closeLabel")}
          onClick={dismiss}
        >
          <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
        </button>
      )}
    </aside>
  )
}
