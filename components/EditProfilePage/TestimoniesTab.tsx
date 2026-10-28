import { useMemo, useState } from "react"
import { Col, Row } from "../bootstrap"
import { TitledSectionCard } from "../shared"
import { TestimonyItem } from "components/TestimonyCard/TestimonyItem"
import { SortTestimonyDropDown } from "components/TestimonyCard/SortTestimonyDropDown"
import { TestimonyFAQ } from "./TestimonyFAQ"
import { Testimony, DraftTestimony, Pagination } from "../db"
import { useTranslation } from "next-i18next"
import { PaginationButtons } from "../table"
import { useHtmlAttribute } from "components/shared/useHtmlAttribute"

export const TestimoniesTab = ({
  publishedTestimonies,
  publishedTestimoniesPagination,
  draftTestimonies,
  draftTestimoniesPagination,
  className
}: {
  publishedTestimonies: Testimony[]
  publishedTestimoniesPagination?: Pagination
  draftTestimonies: DraftTestimony[]
  draftTestimoniesPagination?: Pagination
  className?: string
}) => {
  const [orderBy, setOrderBy] = useState<string>()
  const { t } = useTranslation("editProfile")

  const publishedTestimoniesOrdered = useMemo(() => {
    if (!publishedTestimonies) {
      return []
    }
    return publishedTestimonies.sort((a, b) =>
      orderBy === "Oldest First"
        ? a.publishedAt > b.publishedAt
          ? 1
          : -1
        : a.publishedAt < b.publishedAt
        ? 1
        : -1
    )
  }, [orderBy, publishedTestimonies])

  // Digital Democracy, Mixed and Statehouse: the cards take the profile page's
  // look, with the title in a header band rather than in the card.
  const dd = useHtmlAttribute("data-maple-theme") === "dd"

  return (
    <div className={`mb-4 ${className}`}>
      <Row className="mt-0">
        <Col xs={12} md={8}>
          <TitledSectionCard
            className="mt-3 mb-4"
            title={dd ? t("testimonies.published") : undefined}
          >
            <div>
              <Row>
                <Col>{!dd && <h2>{t("testimonies.published")}</h2>}</Col>
                <Col xs="auto">
                  <SortTestimonyDropDown
                    orderBy={orderBy}
                    setOrderBy={setOrderBy}
                  />
                </Col>
              </Row>
              {publishedTestimoniesOrdered.map(t => (
                <TestimonyItem
                  key={t.authorUid + t.billId + t.publishedAt}
                  testimony={t}
                  isUser={true}
                  onProfilePage={true}
                />
              ))}
              {publishedTestimoniesPagination && (
                <PaginationButtons
                  pagination={publishedTestimoniesPagination}
                />
              )}
            </div>
          </TitledSectionCard>
          <TitledSectionCard
            className="mt-3 mb-4"
            title={dd ? t("testimonies.draft") : undefined}
          >
            <div>
              {!dd && <h2>{t("testimonies.draft")}</h2>}
              {draftTestimonies.map(t => (
                <TestimonyItem
                  key={t.billId + t.court + t.position}
                  testimony={t as any}
                  isUser={true}
                  onProfilePage={true}
                />
              ))}
              {draftTestimoniesPagination && (
                <PaginationButtons pagination={draftTestimoniesPagination} />
              )}
            </div>
          </TitledSectionCard>
        </Col>
        <Col>
          <TestimonyFAQ className={`mt-3 mb-4`} />
        </Col>
      </Row>
    </div>
  )
}
