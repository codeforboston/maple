import { useTranslation } from "next-i18next"
import { KeyboardEvent, useRef } from "react"
import { BallotQuestionTab } from "./types"
import {
  BallotQuestionNavItem,
  BallotQuestionTabButton
} from "./BallotQuestionTabButton"

export const BallotQuestionNav = ({
  activeTab,
  onTabChange,
  testimonyCount,
  showCampaignFinancials,
  showForAndAgainst
}: {
  activeTab: BallotQuestionTab | string
  onTabChange: (tab: BallotQuestionTab) => void
  testimonyCount?: number
  showCampaignFinancials?: boolean
  showForAndAgainst?: boolean
}) => {
  const { t } = useTranslation("ballotquestions")
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const navItems: Array<BallotQuestionNavItem & { enabled: boolean }> = [
    {
      id: "overview",
      label: t("tabs.overview"),
      enabled: true
    },
    {
      id: "testimonies",
      label: t("tabs.perspectives"),
      enabled: true,
      badge: testimonyCount
    },
    {
      id: "for_against",
      label: t("tabs.forAndAgainst"),
      enabled: showForAndAgainst ?? false
    },
    { id: "news", label: t("tabs.news"), enabled: false },
    {
      id: "academia",
      label: t("tabs.academia"),
      enabled: false
    },
    {
      id: "financials",
      label: t("tabs.financials"),
      enabled: showCampaignFinancials ?? false
    },
    { id: "map", label: t("tabs.map"), enabled: false }
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
    <div className="maple-surface rounded-4 p-3 p-lg-4">
      <div className="maple-eyebrow mb-3">
        {t("nav.explore")}
      </div>

      <div
        role="tablist"
        className="d-flex flex-row flex-lg-column gap-2 overflow-x-auto overflow-lg-visible pb-1 pb-lg-0"
        aria-label={t("nav.sectionsAriaLabel")}
      >
        {visibleItems.map((item, itemIndex) => {
          const isActive = activeTab === item.id
          return (
            <div key={item.id} className="flex-shrink-0 flex-lg-fill">
              <BallotQuestionTabButton
                ref={element => {
                  tabRefs.current[itemIndex] = element
                }}
                item={item}
                isActive={isActive}
                onSelect={onTabChange}
                onKeyDown={event => handleKeyDown(event, itemIndex)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
