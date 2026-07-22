import { collection, getDocs, limit, query, where } from "firebase/firestore"
import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import ErrorPage from "next/error"
import { useTranslation } from "next-i18next"
import { useEffect, useState } from "react"
import styled from "styled-components"

import { firestore } from "../firebase"
import * as links from "../links"

import {
  Bluesky,
  DistrictLabel,
  formatPhoneNumber,
  LinkedIn,
  Mastodon,
  PartyLabel,
  Twitter
} from "./LegislatorComponents"
import { LegislatorSidebar } from "./LegislatorSidebar"
import { LegislatorTabs } from "./LegislatorTabs"

import { useAuth } from "components/auth"
import { Col, Container, Row, Spinner } from "components/bootstrap"
import { useDistrict, useMember } from "components/db"
import { Internal } from "components/links"
import { FollowUserButton } from "components/shared/FollowButton"
import { CircleImage } from "components/shared/LabeledIcon"

const ButtonContainer = styled(Col).attrs(props => ({
  className: `col-12 justify-content-md-end ${props.className}`,
  md: `3`,
  sm: `4`
}))`
  width: max-content;
`

const DirectoryPath = styled.div.attrs(props => ({
  className: `align-items-center d-flex flex-nowrap ${props.className}`
}))`
  font-size: 12px;
`

const HeaderBlock = styled.div.attrs(props => ({
  className: `d-flex flex-wrap justify-content-between ${props.className}`
}))`
  background-color: white;
  border: 1px #b8c0c9 solid;
  border-radius: 5px;
  margin-top: 8px;
  padding: 16px;
`

const HeaderName = styled.div`
  font-size: 26px;
  font-weight: 700;
  color: #0b0a3e;
`

const RoleLine = styled.div.attrs(props => ({
  className: `mb-2 ${props.className}`
}))`
  color: #6c757d;
  font-size: 14px;
`

const PhoneNum = styled.span`
  color: #6c757d;
`

const SocialLine = styled.div.attrs(props => ({
  className: `d-flex flex-wrap mb-2 ${props.className}`
}))`
  font-size: 12px;
  text-decoration: none;
`

const StatBlock = styled(Col).attrs(props => ({
  className: `d-flex col-4 flex-grow-1 ${props.className}`,
  md: `2`
}))`
  background-color: white;
  border: 1px #b8c0c9 solid;
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

export function LegislatorProfilePage({
  court,
  memberCode
}: {
  court: number
  memberCode: string
}) {
  const { user } = useAuth()
  const { member, loading: memberLoading } = useMember(court, memberCode)
  const { district, loading: districtLoading } = useDistrict(
    court,
    member?.Branch,
    member?.District
  )
  const { t } = useTranslation("legislators")

  const [legislatorId, setLegislatorId] = useState("")
  const [legislatorData, setLegislatorData] = useState<any[]>([])

  async function getLegislatorUID(memberCode: string) {
    let docList: any[] = []
    const q = query(
      collection(firestore, "profiles"),
      where("memberId", "==", memberCode),
      where("public", "==", true),
      limit(1)
    )
    const docData = await getDocs(q)

    docData.forEach(doc => {
      // doc.data() is never undefined for query doc snapshots
      docList.push(doc.data())
      setLegislatorData(docList)
      setLegislatorId(doc.id)
    })
  }

  useEffect(() => {
    getLegislatorUID(memberCode)
  }, [memberCode])

  if (memberLoading) {
    return (
      <Row>
        <Spinner animation="border" className="mx-auto" />
      </Row>
    )
  }

  if (!member) {
    return <ErrorPage statusCode={404} withDarkMode={false} />
  }

  return (
    <Container className="my-3">
      <DirectoryPath>
        <Internal className="text-decoration-none" href="/">
          {t("home")}
        </Internal>
        <FontAwesomeIcon className="fa-2xs px-2 " icon={faChevronRight} />

        {/* update with link to legistators search page when that is created */}
        <div style={{ color: "#6c757d" }}>{t("legislators")}</div>
        {/* */}

        <FontAwesomeIcon className="fa-2xs px-2 " icon={faChevronRight} />
        <div style={{ color: "#6c757d" }}>{member.Name}</div>
      </DirectoryPath>

      <HeaderBlock>
        <CircleImage className="me-2">
          <img
            src={`https://malegislature.gov/Legislators/Profile/170/${member.MemberCode}.jpg`}
            alt={""}
            className={`image`}
          />
        </CircleImage>

        <Col>
          <Col className="d-flex" xs="6" sm="12">
            <links.External
              href={`https://malegislature.gov/Legislators/Profile/${member.MemberCode}`}
              className="text-decoration-none"
            >
              <HeaderName>{member.Name}</HeaderName>
            </links.External>
          </Col>

          <RoleLine>
            {member.Branch == "Senate" ? (
              <span>{t("stateSenator")}</span>
            ) : (
              <span>{t("stateRepresentative")}</span>
            )}
            {/* <span className="px-2">· Town</span> */}
          </RoleLine>

          <div className="d-flex mb-2">
            <PartyLabel party={member.Party} />
            {/* Incumbent Label */}
            <DistrictLabel district={member.District} />
          </div>

          <SocialLine>
            <div>
              <links.External
                href={`mailto:${member.EmailAddress}`}
                className="text-decoration-none"
              >
                {member.EmailAddress}
              </links.External>
            </div>

            {legislatorData[0]?.website ? (
              <div>
                <span className="px-2">·</span>
                <links.External
                  href={`https://${legislatorData[0].website}`}
                  className="text-decoration-none"
                >
                  {legislatorData[0].website}
                </links.External>
              </div>
            ) : (
              <div>
                <span className="px-2">·</span>
                <links.External
                  href={`https://malegislature.gov/Legislators/Profile/${member.MemberCode}`}
                >
                  {`malegislature.gov/Legislators/Profile/${member.MemberCode}`}
                </links.External>
              </div>
            )}

            {member.PhoneNumber ? (
              <div>
                <span className="px-2">·</span>
                <PhoneNum>{formatPhoneNumber(member.PhoneNumber)}</PhoneNum>
              </div>
            ) : (
              <></>
            )}

            <div>
              {legislatorData[0]?.social.twitter ||
              legislatorData[0]?.social.linkedIn ||
              legislatorData[0]?.social.blueSky ||
              legislatorData[0]?.social.mastodon ? (
                <span className="px-2">·</span>
              ) : (
                <></>
              )}

              {legislatorData[0]?.social.twitter ? (
                <a
                  href={legislatorData[0].social.twitter}
                  className="pe-2"
                  rel="noreferrer"
                  target="_blank"
                  title="Twitter/X"
                >
                  <Twitter />
                </a>
              ) : (
                <></>
              )}

              {legislatorData[0]?.social.linkedIn ? (
                <a
                  href={legislatorData[0].social.linkedIn}
                  className="pe-2"
                  rel="noreferrer"
                  target="_blank"
                  title="linkedIn"
                >
                  <LinkedIn />
                </a>
              ) : (
                <></>
              )}

              {legislatorData[0]?.social.blueSky ? (
                <a
                  href={legislatorData[0].social.blueSky}
                  className="pe-2"
                  rel="noreferrer"
                  target="_blank"
                  title="Bluesky"
                >
                  <Bluesky />
                </a>
              ) : (
                <></>
              )}

              {legislatorData[0]?.social.mastodon ? (
                <a
                  href={legislatorData[0].social.mastodon}
                  className="pe-2"
                  rel="noreferrer"
                  target="_blank"
                  title="Mastodon"
                >
                  <Mastodon />
                </a>
              ) : (
                <></>
              )}
            </div>
          </SocialLine>
        </Col>

        <ButtonContainer>
          {user && legislatorId ? (
            <div className="mb-2">
              <FollowUserButton profileId={legislatorId} />
            </div>
          ) : (
            <></>
          )}
          <links.External
            href={`mailto:${member.EmailAddress}`}
            className="border border-2 border-secondary btn btn-lg fw-bold py-1 text-decoration-none text-secondary w-100"
          >
            {t("contact")}
          </links.External>
        </ButtonContainer>
      </HeaderBlock>

      <div className="d-flex flex-wrap gap-2 justify-content-between mt-2">
        <StatBlock>
          <Col className="flex-grow-0 mx-auto">
            <StatNum>?</StatNum>
            <StatLine>{t("termsServed")}</StatLine>
          </Col>
        </StatBlock>
        <StatBlock>
          <Col className="flex-grow-0 mx-auto">
            <StatNum>{member.SponsoredBills.length}</StatNum>
            <StatLine>{t("billsSponsored")}</StatLine>
          </Col>
        </StatBlock>
        <StatBlock>
          <Col className="flex-grow-0 mx-auto">
            <StatNum>{member.CoSponsoredBills.length}</StatNum>
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

      <Row className={`mt-4`}>
        <Col md="9">
          <LegislatorTabs
            district={district}
            districtLoading={districtLoading}
            legislatorId={legislatorId}
            name={member.Name}
          />
        </Col>
        <Col md="3">
          <LegislatorSidebar
            court={court}
            legislatorData={legislatorData}
            legislatorId={legislatorId}
            memberCode={memberCode}
          />
        </Col>
      </Row>
    </Container>
  )
}
