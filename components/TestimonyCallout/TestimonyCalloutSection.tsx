import { Carousel, CarouselItem } from "react-bootstrap"
import { useMediaQuery } from "usehooks-ts"
import { Button, Col, Container, Row } from "../bootstrap"
import { useRecentTestimony } from "../db"
import TestimonyCallout from "./TestimonyCallout"
import { useTranslation } from "next-i18next"
import { Internal } from "components/links"
import styles from "components/homepage/Homepage.module.css"

export default function TestimonyCalloutSection() {
  const recentTestimony = useRecentTestimony(4)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const { t } = useTranslation("testimony")

  return (
    <section className={styles.sectionShell}>
      <Row className={styles.peopleSaying}>
        <Col xs={12} sm={12} md={7} className={styles.sectionTitle}>
          <h2>{t("testimonyCalloutSection.peopleSaying")}</h2>
        </Col>
        <Col xs={12} sm={12} md={5}>
          <div
            className={`d-flex ${
              isMobile ? "justify-content-center" : "justify-content-end"
            }  me-2`}
          >
            <Internal href="/testimony">
              <Button className={`btn btn-lg py-1`}>
                {t("testimonyCalloutSection.browseTestimony")}
              </Button>
            </Internal>
          </div>
        </Col>
      </Row>
      {isMobile ? (
        <Carousel
          style={{
            height: "100%",
            width: "80%",
            margin: "auto",
            paddingBottom: "3rem"
          }}
          variant="dark"
          wrap
          controls={false}
        >
          {recentTestimony?.map(testimony => (
            <Carousel.Item key={testimony.authorUid + testimony.billId}>
              <div style={{ width: "100%", height: "100%" }}>
                <TestimonyCallout {...testimony} />
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      ) : (
        <Row className="justify-content-center">
          <Col xs={11} xl={11} xxl={11}>
            <Row xs={1} lg={2} className={`g-3 justify-content-between py-2`}>
              {recentTestimony?.map(testimony => (
                <TestimonyCallout
                  key={testimony.authorUid + testimony.billId}
                  {...testimony}
                />
              ))}
            </Row>
          </Col>
        </Row>
      )}
    </section>
  )
}
