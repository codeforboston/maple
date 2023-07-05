import { Carousel, CarouselItem } from "react-bootstrap"
import { useMediaQuery } from "usehooks-ts"
import { Button, Col, Container, Row } from "../bootstrap"
import { useRecentTestimony } from "../db"
import TestimonyCallout from "./TestimonyCallout"
import { useTranslation } from "next-i18next"
import { Internal } from "components/links"

export default function TestimonyCalloutSection() {
  const recentTestimony = useRecentTestimony(4)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const { t } = useTranslation("testimony")

  return (
    <Container fluid>
      <Row className="mt-5 justify-content-center">
        <Col xs={10} md={6}>
          <h1>{t("testimonyCalloutSection.peopleSaying")}</h1>
        </Col>
        <Col xs={10} md={3}>
          <div>
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
          <Col xs={10} xl={9} xxl={8}>
            <Row
              xs={1}
              lg={2}
              className={`g-2 justify-content-center py-2 mt-4`}
            >
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
    </Container>
  )
}
