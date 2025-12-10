import { Trans, useTranslation } from "next-i18next"
import Image from "react-bootstrap/Image"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"
import { Col, Row } from "../bootstrap"
import * as links from "../links"

const SmartTagDesc = styled(Row)`
  font-size: 12px;
`

export const SmartDisclaimer = () => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { t } = useTranslation("common")

  return (
    <>
      {isMobile ? (
        <div className={`m-3`}>
          <Row className={`fs-5 fw-bold`} fontSize={"12px"}>
            {t("bill.smart_summary")}
          </Row>
          <SmartTagDesc>
            <Col>
              <Trans
                t={t}
                i18nKey="bill.smart_disclaimer"
                components={[
                  // eslint-disable-next-line react/jsx-key
                  <links.Internal href="/about/how-maple-uses-ai" />
                ]}
              />
            </Col>
          </SmartTagDesc>
        </div>
      ) : (
        <Row className={`d-flex my-3`} fontSize={"12px"} xs="auto">
          <Col>
            <Image src="/images/smart-summary.svg" alt={t("bill.smart_tag")} />
          </Col>
          <Col className={`mt-1`} xs="10">
            <Row className={`fs-5 fw-bold`}>{t("bill.smart_summary")}</Row>
            <SmartTagDesc>
              <Col>
                <Trans
                  t={t}
                  i18nKey="bill.smart_disclaimer"
                  components={[
                    // eslint-disable-next-line react/jsx-key
                    <links.Internal href="/about/how-maple-uses-ai" />
                  ]}
                />
              </Col>
            </SmartTagDesc>
          </Col>
        </Row>
      )}
    </>
  )
}
