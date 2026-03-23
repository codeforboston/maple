import { Nav } from "react-bootstrap"

type Tab = "overview" | "testimonies" | "synthesis" | "for_against" | "news" | "academia" | "financials" | "map"

export const BallotQuestionNav = ({
  activeTab,
  onTabChange,
  testimonyCount
}: {
  activeTab: Tab | string
  onTabChange: (tab: Tab) => void
  testimonyCount?: number
}) => {
  const navItems: Array<{
    id: Tab
    label: string
    badge?: number
    enabled: boolean
  }> = [
    { id: "overview", label: "Overview", enabled: true },
    { id: "testimonies", label: "Testimonies", enabled: true, badge: testimonyCount },
    { id: "synthesis", label: "Synthesis & Insights", enabled: false },
    { id: "for_against", label: "For & Against", enabled: false },
    { id: "news", label: "News & Media", enabled: false },
    { id: "academia", label: "Academia", enabled: false },
    { id: "financials", label: "Campaign Financials", enabled: false },
    { id: "map", label: "Map", enabled: false }
  ]

  return (
    <div className="rounded border bg-white p-3 shadow-sm">
      <Nav variant="pills" className="flex-column gap-1">
        {navItems.map(item => {
          const isActive = activeTab === item.id
          return (
            <Nav.Item key={item.id}>
              <Nav.Link
                active={false}
                aria-current={isActive ? "page" : undefined}
                onClick={() => item.enabled && onTabChange(item.id)}
                disabled={!item.enabled}
                className={`rounded px-3 py-2 d-flex align-items-center justify-content-between small fw-medium ${
                  !item.enabled ? "text-muted" : ""
                }`}
                style={{
                  cursor: item.enabled ? "pointer" : "default",
                  backgroundColor: isActive
                    ? "var(--bs-blue-100)"
                    : "transparent",
                  border: isActive
                    ? "1px solid var(--bs-blue-300)"
                    : "1px solid transparent",
                  color: isActive ? "var(--bs-secondary)" : undefined
                }}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className="badge rounded-pill"
                    style={{
                      backgroundColor: "var(--bs-secondary)",
                      color: "white",
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
