import { faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Col, Container, Row } from "../bootstrap"
import { useRecentTestimony } from "../db"
import TestimonyFeed from "./TestimonyFeed"
import { useTranslation } from "next-i18next"
import { Internal } from "components/links"
import styles from "components/homepage/Homepage.module.css"

export default function TestimonyCalloutSection() {
  const recentTestimony = useRecentTestimony(4)

  const { t } = useTranslation("testimony")

  return (
    <section className={styles.testimonyBand}>
      <div className={styles.sectionShell}>
        <Row className={styles.peopleSaying}>
          <Col xs={12} sm={12} md={7} className={styles.sectionTitle}>
            <h2>{t("testimonyCalloutSection.peopleSaying")}</h2>
          </Col>
        </Row>
        {/* The latest testimony as quote cards (TestimonyFeed). */}
        <Row className="justify-content-center">
          <Col xs={11}>
            {recentTestimony?.length ? (
              // Two by two from lg (TestimonyFeed's columns).
              <TestimonyFeed
                testimony={recentTestimony}
                variant="quote"
                columns={2}
              />
            ) : null}
            {/* Browse All Testimony, as a text link with an arrow under the
              testimony, in the feed's column so it ends where the feed
              does. */}
            <div
              className={`${styles.browseTestimony} ${styles.browseTestimonyWide}`}
            >
              <Internal
                href="/testimony"
                className={styles.browseTestimonyLink}
              >
                {t("testimonyCalloutSection.browseTestimony")}
                <FontAwesomeIcon icon={faArrowRight} aria-hidden />
              </Internal>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  )
}
