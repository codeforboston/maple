import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTranslation } from "next-i18next"
import ErrorPage from "next/error"
import styled from "styled-components"

import { Col, Container, Row, Spinner } from "../bootstrap"
import { usePublicProfile } from "../db"

import { LegislatorSidebar } from "./SidebarComponents/LegislatorSidebar"
import { LegislatorTabs } from "./TabComponents/LegislatorTabs"

import { useFlags } from "components/featureFlags"
import { Internal } from "components/links"

const DirectoryPath = styled.div.attrs(props => ({
  className: `align-items-center d-flex flex-nowrap ${props.className}`
}))`
  font-size: 12px;
`

const HeaderBlock = styled.div`
  background-color: white;
  border: "1px #ced4da solid";
  border-radius: 5px;
  margin-top: 8px;
  padding: 16px;
`

const StatBlock = styled(Col).attrs(props => ({
  className: `d-flex col-4 flex-grow-1 ${props.className}`,
  md: `2`
}))`
  background-color: white;
  border: 1px #ced4da solid;
  border-radius: 5px;
  margin-top: 4px;
  padding: 16px;
`

const StatLine = styled(Row).attrs(props => ({
  className: `text-nowrap ${props.className}`
}))`
  font-size: 12px;
`

const StatNum = styled.div.attrs(props => ({
  className: `mx-auto ${props.className}`
}))`
  color: #1a3185;
  font-size: 22px;
  font-weight: 700;
  width: max-content;
`

export function LegislatorPage(props: { id: string }) {
  const { t } = useTranslation("legislators")
  const { result: profile, loading } = usePublicProfile(props.id)
  const { legislators } = useFlags()

  console.log("Pro: ", profile)

  if (loading) {
    return (
      <Row>
        <Spinner animation="border" className="mx-auto" />
      </Row>
    )
  }
  if (!legislators) {
    return <ErrorPage statusCode={404} withDarkMode={false} />
  }
  if (!profile) {
    return <ErrorPage statusCode={404} withDarkMode={false} />
  }

  return (
    <Container className="mt-3 mb-3">
      <DirectoryPath>
        <Internal className="text-decoration-none" href="/">
          {t("home")}
        </Internal>
        <FontAwesomeIcon className="fa-2xs px-2 " icon={faChevronRight} />
        <div style={{ color: "#6c757d" }}>{t("legislators")}</div>
        <FontAwesomeIcon className="fa-2xs px-2 " icon={faChevronRight} />
        <div style={{ color: "#6c757d" }}>{profile.fullName}</div>
      </DirectoryPath>

      <HeaderBlock>Header Info Goes Here</HeaderBlock>

      <div className="d-flex flex-wrap gap-2 justify-content-between mt-2">
        <StatBlock>
          <Col className="flex-grow-0 mx-auto">
            <StatNum>?</StatNum>
            <StatLine>{t("termsServed")}</StatLine>
          </Col>
        </StatBlock>
        <StatBlock>
          <Col className="flex-grow-0 mx-auto">
            <StatNum>?</StatNum>
            <StatLine>{t("billsSponsored")}</StatLine>
          </Col>
        </StatBlock>
        <StatBlock>
          <Col className="flex-grow-0 mx-auto">
            <StatNum>?</StatNum>
            <StatLine>{t("cosponsored")}</StatLine>
          </Col>
        </StatBlock>
        <StatBlock>
          <Col className="flex-grow-0 mx-auto">
            <StatNum>?</StatNum>
            <StatLine>{t("fundsRaised")}</StatLine>
          </Col>
        </StatBlock>
      </div>

      <Row>
        <Col className={`mt-4`} md="9">
          <LegislatorTabs />
        </Col>
        <Col className={`mt-4`} md="3">
          <LegislatorSidebar pageId={props.id} publicProfile={profile} />
        </Col>
      </Row>
    </Container>
  )
}
