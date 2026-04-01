import { KeyboardEvent, useRef } from "react"
import {
  BallotQuestionTab,
  getBallotQuestionPanelId,
  getBallotQuestionTabId
} from "./types"

export const BallotQuestionNav = ({
  activeTab,
  onTabChange,
  testimonyCount
}: {
  activeTab: BallotQuestionTab | string
  onTabChange: (tab: BallotQuestionTab) => void
  testimonyCount?: number
}) => {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const navItems: Array<{
    id: BallotQuestionTab
    label: string
    badge?: number
    enabled: boolean
  }> = [
    { id: "overview", label: "Overview", enabled: true },
    {
      id: "testimonies",
      label: "Testimonies",
      enabled: true,
      badge: testimonyCount
    },
    { id: "synthesis", label: "Synthesis & Insights", enabled: false },
    { id: "for_against", label: "For & Against", enabled: false },
    { id: "news", label: "News & Media", enabled: false },
    { id: "academia", label: "Academia", enabled: false },
    { id: "financials", label: "Campaign Financials", enabled: false },
    { id: "map", label: "Map", enabled: false }
  ]
  const visibleItems = navItems.filter(item => item.enabled)

  const moveFocus = (index: number) => {
    const nextItem = visibleItems[index]
    if (!nextItem) return
    onTabChange(nextItem.id)
    tabRefs.current[index]?.focus()
  }

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        event.preventDefault()
        moveFocus((currentIndex + 1) % visibleItems.length)
        break
      case "ArrowUp":
      case "ArrowLeft":
        event.preventDefault()
        moveFocus(
          (currentIndex - 1 + visibleItems.length) % visibleItems.length
        )
        break
      case "Home":
        event.preventDefault()
        moveFocus(0)
        break
      case "End":
        event.preventDefault()
        moveFocus(visibleItems.length - 1)
        break
      default:
        break
    }
  }

  return (
    <div
      className="rounded-4 border bg-white p-3 p-lg-4 shadow-sm"
      style={{
        borderColor: "rgba(15, 23, 42, 0.08)",
        boxShadow: "0 0.5rem 1.5rem rgba(15, 23, 42, 0.06)"
      }}
    >
      <div className="mb-3 mb-lg-4">
        <div
          className="text-uppercase fw-semibold mb-1"
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
            color: "#64748b"
          }}
        >
          Explore
        </div>
        <p className="mb-0 small text-body-secondary">
          Move between the question overview and public testimony.
        </p>
      </div>

      <div
        role="tablist"
        className="d-flex flex-row flex-lg-column gap-2"
        aria-label="Ballot question sections"
      >
        {visibleItems.map((item, itemIndex) => {
          const isActive = activeTab === item.id
          return (
            <div key={item.id} className="flex-fill">
              <button
                ref={element => {
                  tabRefs.current[itemIndex] = element
                }}
                type="button"
                role="tab"
                id={getBallotQuestionTabId(item.id)}
                aria-selected={isActive}
                aria-controls={getBallotQuestionPanelId(item.id)}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onTabChange(item.id)}
                onKeyDown={event => handleKeyDown(event, itemIndex)}
                className="ballot-question-tab-button rounded-3 px-3 py-3 d-flex align-items-center justify-content-between gap-3 small fw-medium h-100 w-100 text-start"
                style={{
                  cursor: "pointer",
                  backgroundColor: isActive
                    ? "rgba(94, 114, 228, 0.08)"
                    : "#f8fafc",
                  border: isActive
                    ? "1px solid rgba(94, 114, 228, 0.35)"
                    : "1px solid rgba(15, 23, 42, 0.08)",
                  color: isActive ? "var(--bs-secondary)" : "#334155"
                }}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className="badge rounded-pill"
                    style={{
                      backgroundColor: isActive
                        ? "var(--bs-secondary)"
                        : "rgba(15, 23, 42, 0.08)",
                      color: isActive ? "white" : "#334155",
                      fontWeight: 600,
                      minWidth: "1.5rem"
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
