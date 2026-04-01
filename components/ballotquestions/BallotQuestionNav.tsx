import { Nav } from "react-bootstrap"
import { BallotQuestionTab } from "./types"

export const BallotQuestionNav = ({
  activeTab,
  onTabChange,
  testimonyCount
}: {
  activeTab: BallotQuestionTab | string
  onTabChange: (tab: BallotQuestionTab) => void
  testimonyCount?: number
}) => {
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

      <Nav
        variant="pills"
        className="flex-row flex-lg-column gap-2"
        aria-label="Ballot question sections"
      >
        {visibleItems.map(item => {
          const isActive = activeTab === item.id
          return (
            <Nav.Item key={item.id} className="flex-fill">
              <Nav.Link
                active={false}
                aria-current={isActive ? "page" : undefined}
                onClick={() => onTabChange(item.id)}
                className="rounded-3 px-3 py-3 d-flex align-items-center justify-content-between gap-3 small fw-medium h-100"
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
              </Nav.Link>
            </Nav.Item>
          )
        })}
      </Nav>
    </div>
  )
}
