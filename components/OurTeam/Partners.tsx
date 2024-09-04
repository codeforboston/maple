import styled from "styled-components"
import AboutPagesCard from "../AboutPagesCard/AboutPagesCard"
import { Col, Container, Row } from "../bootstrap"
import {
  CodeForBostonCardContent,
  NuLawLabCardContent,
  OpenCollectiveContent
} from "../OurPartnersCardContent/OurPartnersCardContent"
import { PageTitle, PageDescr } from "./CommonComponents"

import { useTranslation } from "next-i18next"

export const OurPartners = () => {
  const { t } = useTranslation("common")

  return (
    <Container>
      <Row>
        <Col>
          <PageTitle>{t("partners.header")}</PageTitle>
        </Col>
      </Row>
      <Row>
        <Col className="py-3">
          <PageDescr>
            {t("partners.desc1")}{" "}
            <StyleLink
              href="https://www.bc.edu/bc-web/schools/law.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("partners.desc2")}
            </StyleLink>{" "}
            {t("partners.desc3")}{" "}
            <StyleLink
              href="https://cyber.harvard.edu/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("partners.desc4")}
            </StyleLink>
            .
          </PageDescr>
        </Col>
      </Row>
      <Row>
        <Col>
          <AboutPagesCard title="NuLawLab">
            <NuLawLabCardContent />
          </AboutPagesCard>
        </Col>
      </Row>
      <Row>
        <Col>
          <AboutPagesCard title="Code for Boston">
            <CodeForBostonCardContent />
          </AboutPagesCard>
        </Col>
      </Row>
      <Row>
        <Col>
          <AboutPagesCard title="Partners in Democracy">
            <Row>
              <OpenCollectiveContent />
            </Row>
          </AboutPagesCard>
        </Col>
      </Row>
    </Container>
  )
}

const StyleLink = styled.a`
  text-decoration: none;
  color: var(--bs-blue);
`
