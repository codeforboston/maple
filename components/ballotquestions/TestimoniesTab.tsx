import { useTranslation } from "next-i18next"
import Link from "next/link"
import { Image } from "react-bootstrap"
import ViewTestimony from "../TestimonyCard/ViewTestimony"
import { BallotQuestion, Bill, UsePublishedTestimonyListing } from "../db"
import { isActiveBallotQuestionPhase } from "./status"
import { BallotQuestionTestimonySummary } from "./types"

export const TestimoniesTab = ({
  ballotQuestion,
  bill,
  testimony,
  testimonySummary
}: {
  ballotQuestion: BallotQuestion
  bill: Bill | null
  testimony: UsePublishedTestimonyListing
  testimonySummary: BallotQuestionTestimonySummary
}) => {
  const { t } = useTranslation("ballotquestions")
  const isExpectedOnBallotPhase =
    ballotQuestion.ballotStatus === "expectedOnBallot"
  const allowEdit = isActiveBallotQuestionPhase(ballotQuestion.ballotStatus)
  const totalLabel = t("testimonies.total", {
    count: testimonySummary.testimonyCount
  })

  return (
    <div className="d-grid gap-4">
      <div className="maple-surface rounded-4 p-4">
        <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
          <div className="d-flex align-items-start gap-3">
            <div
              className="maple-icon-chip rounded-4 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "2.75rem",
                height: "2.75rem"
              }}
            >
              <Image src="/bill-thank-you.svg" alt="" width={22} height={18} />
            </div>
            <div>
              <h2 className="h4 mb-1 text-secondary">
                {t("testimonies.title")}
              </h2>
              <p className="text-body-secondary small mb-0">{totalLabel}</p>
              {isExpectedOnBallotPhase && bill && (
                <p
                  className="small text-body-secondary mt-3 mb-0"
                  style={{ maxWidth: "44rem" }}
                >
                  {t("testimonies.relatedBillPrefix")}{" "}
                  <Link
                    href={`/bills/${bill.court}/${bill.id}#testimonies`}
                    className="fw-semibold text-decoration-none"
                  >
                    {t("testimonies.relatedBillLink")}
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>
        </div>

        <div
          className="border-top pt-4"
          style={{ borderColor: "var(--maple-surface-border)" }}
        >
          <div className="row g-3">
            <div className="col-md-4">
              <SummaryItem
                label={t("testimonies.endorse")}
                count={testimonySummary.endorseCount}
                icon="/thumbs-endorse.svg"
                color="var(--bs-green)"
              />
            </div>
            <div className="col-md-4">
              <SummaryItem
                label={t("testimonies.neutral")}
                count={testimonySummary.neutralCount}
                icon="/thumbs-neutral.svg"
                color="var(--bs-blue)"
              />
            </div>
            <div className="col-md-4">
              <SummaryItem
                label={t("testimonies.oppose")}
                count={testimonySummary.opposeCount}
                icon="/thumbs-oppose.svg"
                color="var(--bs-orange)"
              />
            </div>
          </div>
        </div>
      </div>

      <ViewTestimony
        {...testimony}
        onProfilePage={false}
        variant="ballotQuestion"
        allowEdit={allowEdit}
        totalTestimonies={testimonySummary.testimonyCount}
      />
    </div>
  )
}

function SummaryItem({
  label,
  count,
  icon,
  color
}: {
  label: string
  count: number
  icon: string
  color: string
}) {
  return (
    <div className="maple-muted-surface rounded-4 h-100 px-3 py-3">
      <div className="d-flex align-items-center justify-content-between gap-3">
        <div>
          <div className="maple-eyebrow mb-1">{label}</div>
          <div
            className="fw-semibold"
            style={{ color, fontSize: "1.75rem", lineHeight: 1 }}
          >
            {count}
          </div>
        </div>
        <div
          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: "2.5rem",
            height: "2.5rem",
            backgroundColor: "var(--maple-surface-base)",
            border: "1px solid var(--maple-surface-border)"
          }}
        >
          <Image src={icon} alt="" width={18} height={18} />
        </div>
      </div>
    </div>
  )
}
