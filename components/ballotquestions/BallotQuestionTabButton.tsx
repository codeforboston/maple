import { forwardRef, KeyboardEventHandler } from "react"
import {
  BallotQuestionTab,
  getBallotQuestionPanelId,
  getBallotQuestionTabId
} from "./types"

export type BallotQuestionNavItem = {
  id: BallotQuestionTab
  label: string
  badge?: number
}

type BallotQuestionTabButtonProps = {
  item: BallotQuestionNavItem
  isActive: boolean
  onSelect: (tab: BallotQuestionTab) => void
  onKeyDown: KeyboardEventHandler<HTMLButtonElement>
}

export const BallotQuestionTabButton = forwardRef<
  HTMLButtonElement,
  BallotQuestionTabButtonProps
>(({ item, isActive, onSelect, onKeyDown }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={getBallotQuestionTabId(item.id)}
      aria-selected={isActive}
      aria-controls={getBallotQuestionPanelId(item.id)}
      tabIndex={isActive ? 0 : -1}
      onClick={() => onSelect(item.id)}
      onKeyDown={onKeyDown}
      className={`ballot-question-nav-link rounded-3 px-3 py-3 d-flex align-items-center justify-content-between gap-3 small fw-medium h-100 w-100 text-start ${
        isActive ? "is-active" : ""
      }`}
    >
      <span>{item.label}</span>
      {item.badge !== undefined && (
        <span
          className={`ballot-question-nav-badge badge rounded-pill ${
            isActive ? "is-active" : ""
          }`}
        >
          {item.badge}
        </span>
      )}
    </button>
  )
})

BallotQuestionTabButton.displayName = "BallotQuestionTabButton"
