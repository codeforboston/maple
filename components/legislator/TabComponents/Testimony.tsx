import { useEffect, useMemo } from "react"
import { useTranslation } from "next-i18next"
import { SmartDisclaimer } from "components/bill/SmartDisclaimer"
import { TestimonyItem } from "components/TestimonyCard/TestimonyItem"
import { usePublishedTestimonyListing } from "components/db/testimony/usePublishedTestimonyListing"
import { CURRENT_COURT_NUMBER } from "components/search/courtSessions"
import { NoResults } from "components/search/NoResults"
import { useAuth } from "components/auth"

export function Testimony({ legislatorId }: { legislatorId?: string }) {
  const { t } = useTranslation("testimony")
  const { user } = useAuth()

  // Query testimonies where legislator is a representative
  const representativeTestimony = usePublishedTestimonyListing({
    court: CURRENT_COURT_NUMBER
  })

  // Query testimonies where legislator is a senator
  const senatorTestimony = usePublishedTestimonyListing({
    court: CURRENT_COURT_NUMBER
  })

  // Apply legislator filters
  useEffect(() => {
    if (legislatorId) {
      representativeTestimony.setFilter({ representativeId: legislatorId })
    }
  }, [legislatorId, representativeTestimony])

  useEffect(() => {
    if (legislatorId) {
      senatorTestimony.setFilter({ senatorId: legislatorId })
    }
  }, [legislatorId, senatorTestimony])

  const allTestimonies = useMemo(() => {
    const repTestimonies = representativeTestimony.items.result ?? []
    const senTestimonies = senatorTestimony.items.result ?? []

    // Combine and sort by publishedAt (newest first), then take 4 most recent
    return [...repTestimonies, ...senTestimonies]
      .sort((a, b) => b.publishedAt.toMillis() - a.publishedAt.toMillis())
      .slice(0, 4)
  }, [representativeTestimony.items.result, senatorTestimony.items.result])

  return (
    <>
      <SmartDisclaimer />
      {allTestimonies.length > 0 ? (
        <div>
          {allTestimonies.map(testimony => (
            <TestimonyItem
              key={testimony.id}
              testimony={testimony}
              isUser={testimony.authorUid === user?.uid}
              onProfilePage={true}
            />
          ))}
        </div>
      ) : (
        <NoResults>{t("viewTestimony.noTestimonies")}</NoResults>
      )}
    </>
  )
}
