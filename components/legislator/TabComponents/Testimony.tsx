import { useMemo } from "react"
import { useTranslation } from "next-i18next"
import styled from "styled-components"

import { useAuth } from "components/auth"
import { SmartDisclaimer } from "components/bill/SmartDisclaimer"
import { usePublishedTestimonyListing } from "components/db/testimony/usePublishedTestimonyListing"
import { NoResults } from "components/search/NoResults"
import { TestimonyItem } from "components/TestimonyCard/TestimonyItem"

const DisclaimerBlock = styled.div`
  align-items: flex-start;
  background-color: #f0f4ff;
  border: "1px #d1d6e7 solid";
  border-radius: 5px;
  color: #1a3185;
  display: flex;
  font-size: 13px;
  gap: 10px;
  line-height: 1.6;
  margin-top: 14px;
  margin-bottom: 14px;
  padding: 12px 16px;
`

const TestimonyBlock = styled.div`
  background-color: white;
  border: "1px #ced4da solid";
  border-radius: 5px;
  font-size: 11px;
  margin-bottom: 14px;
  padding: 0px 16px;
`

function Disclaimer({ fullname }: { fullname?: string }) {
  const { t } = useTranslation("legislators")

  return (
    <DisclaimerBlock>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#1a3185"
        stroke-width="2"
        // style="flex-shrink:0;margin-top:1px"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <div>
        {fullname} {t("canSubmit")}
      </div>
    </DisclaimerBlock>
  )
}

export function Testimony({
  fullname,
  pageId
}: {
  fullname?: string
  pageId?: string
}) {
  const { t } = useTranslation("testimony")
  const { user } = useAuth()

  const testimony = usePublishedTestimonyListing({
    uid: pageId
  })

  const allTestimonies = useMemo(() => {
    const legislatorTestimonies = testimony.items.result ?? []

    // Combine and sort by publishedAt (newest first), then take 4 most recent
    return [...legislatorTestimonies]
      .sort((a, b) => b.publishedAt.toMillis() - a.publishedAt.toMillis())
      .slice(0, 4)
  }, [testimony.items.result])

  return (
    <>
      <Disclaimer fullname={fullname} />
      {allTestimonies.length > 0 ? (
        <div>
          {allTestimonies.map(testimony => (
            <TestimonyBlock key={testimony.id}>
              <TestimonyItem
                testimony={testimony}
                isUser={testimony.authorUid === user?.uid}
                onProfilePage={true}
              />
            </TestimonyBlock>
          ))}
        </div>
      ) : (
        <NoResults>{t("viewTestimony.noTestimonies")}</NoResults>
      )}
    </>
  )
}
