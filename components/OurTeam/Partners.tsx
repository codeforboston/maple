import { useTranslation } from "next-i18next"
import styled from "styled-components"
import AboutPagesCard from "../AboutPagesCard/AboutPagesCard"
import { Col, Container, Row } from "../bootstrap"
import {
  CodeForBostonCardContent,
  NuLawLabCardContent,
  OpenCollectiveContent
} from "../OurPartnersCardContent/OurPartnersCardContent"
import { PageTitle, PageDescr } from "./CommonComponents"

export const OurPartners = () => {
  const { t } = useTranslation("common")

  {
    /*linter does not like literal strings */
  }
  const untranslatedProperTitle1 = "NuLawLab"
  const untranslatedProperTitle2 = "Boston College Law School"
  const untranslatedProperTitle3 =
    "Harvard University's Berkman Klein Center for Internet & Society"

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
            {t("partners.desc1")} {untranslatedProperTitle1}{" "}
            {t("partners.desc2")}
            <StyleLink
              href="https://www.bc.edu/bc-web/schools/law.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              {" "}
              {untranslatedProperTitle2}
            </StyleLink>{" "}
            {t("partners.desc3")}{" "}
            <StyleLink
              href="https://cyber.harvard.edu/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {untranslatedProperTitle3}
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
