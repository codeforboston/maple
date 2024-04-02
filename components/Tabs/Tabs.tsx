import React, { FC } from "react"
import clsx from "clsx"

type TabsProps = {
  tabs: {
    label: string
    index: number
    Component: FC<React.PropsWithChildren<{ index: number }>>
  }[]
  selectedTab: number
  onClick: (index: number) => void
  orientation?: "horizontal" | "vertical"
  className?: string
}

/**
 * Available Props
 * @param className string
 * @param tab Array of object
 * @param selectedTab number
 * @param onClick Function to set the active tab
 * @param orientation Tab orientation Vertical | Horizontal
 */
const Tabs: FC<React.PropsWithChildren<TabsProps>> = ({
  className = "tabs-component",
  tabs = [],
  selectedTab = 0,
  onClick,
  orientation = "horizontal"
}) => {
  const Panel = tabs && tabs.find(tab => tab.index === selectedTab)

  return (
    <div>
      <div
        className="d-flex justify-content-between mt-3 mb-2 mx-3 mx-md-5"
        role="tablist"
        aria-orientation={orientation}
      >
        {tabs.map(tab => (
          <button
            className={clsx(
              "border-0 bg-transparent fs-4 fw-bold",
              selectedTab === tab.index &&
                "text-secondary text-decoration-underline"
            )}
            onClick={() => onClick(tab.index)}
            key={tab.index}
            type="button"
            role="tab"
            aria-selected={selectedTab === tab.index}
            aria-controls={`tabpanel-${tab.index}`}
            tabIndex={selectedTab === tab.index ? 0 : -1}
            id={`btn-${tab.index}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        aria-labelledby={`btn-${selectedTab}`}
        id={`tabpanel-${selectedTab}`}
      >
        {Panel && <Panel.Component index={selectedTab} />}
      </div>
    </div>
  )
}
export default Tabs
