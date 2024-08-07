import { useMemo, useState } from "react"
import { Col, Row } from "../bootstrap"
import { TitledSectionCard } from "../shared"
import { TestimonyItem } from "components/TestimonyCard/TestimonyItem"
import { SortTestimonyDropDown } from "components/TestimonyCard/SortTestimonyDropDown"
import { TestimonyFAQ } from "./TestimonyFAQ"
import { Testimony } from "../db"
import { useTranslation } from "next-i18next"

export const TestimoniesTab = ({
  publishedTestimonies,
  draftTestimonies,
  className
}: {
  publishedTestimonies: Testimony[]
  draftTestimonies: Testimony[]
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

  return (
    <div className={`mb-4 ${className}`}>
      <Row className="mt-0">
        <Col xs={12} md={8}>
          <TitledSectionCard className="mt-3 mb-4">
            <Row>
              <Col>
                <h2>{t("testimonies.published")}</h2>
              </Col>
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
          </TitledSectionCard>
          <TitledSectionCard className="mt-3 mb-4">
            <h2>{t("testimonies.draft")}</h2>
            {draftTestimonies.map(t => (
              <TestimonyItem
                key={t.authorUid + t.billId + t.publishedAt}
                testimony={t}
                isUser={true}
                onProfilePage={true}
              />
            ))}
          </TitledSectionCard>
        </Col>
        <Col>
          <TestimonyFAQ className={`mt-3 mb-4`} />
        </Col>
      </Row>
    </div>
  )
}
