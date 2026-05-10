import { doc, getDoc } from "firebase/firestore"
import {
  faAddressBook,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTranslation } from "next-i18next"
import ErrorPage from "next/error"
import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"

import { Col, Container, Row, Spinner } from "../bootstrap"
import { usePublicProfile } from "../db"
import { firestore } from "../firebase"
import * as links from "../links"

import { Bluesky, LinkedIn, Twitter } from "./LegislatorComponents"
import { LegislatorSidebar } from "./SidebarComponents/LegislatorSidebar"
import { LegislatorTabs } from "./TabComponents/LegislatorTabs"

import { useFlags } from "components/featureFlags"
import { Internal } from "components/links"
import { CircleImage } from "components/shared/LabeledIcon"

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

const HeaderName = styled.div`
  font-size: 26px;
  font-weight: 700;
  color: #0b0a3e;
`

const RoleLine = styled.div`
  font-size: 14px;
  color: #6c757d;
`

const PhoneNum = styled.span`
  color: #6c757d;
`

const SocialLine = styled.div.attrs(props => ({
  className: `d-flex flex-wrap ${props.className}`
}))`
  font-size: 12px;
  text-decoration: none;
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

  // eventually this should be replaced with a profile prop array that
  // contains a list of courts the legislator served on
  const viableCourts = "194"

  const [branch, setBranch] = useState<string>("")
  const [cosponsoredBills, setCosponsoredBills] = useState<Array<string>>([""])
  const [district, setDistrict] = useState<string>("")
  const [party, setParty] = useState<string>("")
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [sponsoredBills, setSponsoredBills] = useState<Array<string>>([""])

  const memberData = useCallback(async () => {
    const member = await getDoc(
      doc(
        firestore,
        `generalCourts/${viableCourts}/members/${profile?.memberId}`
      )
    )
    const docData = member.data()

    setBranch(docData?.content.Branch)
    setCosponsoredBills(docData?.content.CoSponsoredBills)
    setDistrict(docData?.content.District)
    setParty(docData?.content.Party)
    setPhoneNumber(docData?.content.PhoneNumber)
    setSponsoredBills(docData?.content.SponsoredBills)
  }, [district, party, phoneNumber])

  useEffect(() => {
    profile ? memberData() : null
  }, [memberData, profile])

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

  const formatPhoneNumber = (value: string) => {
    if (!value) return value

    const phoneNumber = value.replace(/[^\d]/g, "")
    const phoneNumberLength = phoneNumber.length

    // Format as (XXX) XXX-XXXX
    if (phoneNumberLength < 4) return phoneNumber
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    }
    return `
      (${phoneNumber.slice(0, 3)})
       ${phoneNumber.slice(3, 6)}-
       ${phoneNumber.slice(6, 10)}
    `
  }

  console.log("Pro: ", profile)
  console.log("SB: ", sponsoredBills)

  return (
    <Container className="my-3">
      <DirectoryPath>
        <Internal className="text-decoration-none" href="/">
          {t("home")}
        </Internal>
        <FontAwesomeIcon className="fa-2xs px-2 " icon={faChevronRight} />
        <div style={{ color: "#6c757d" }}>{t("legislators")}</div>
        <FontAwesomeIcon className="fa-2xs px-2 " icon={faChevronRight} />
        <div style={{ color: "#6c757d" }}>{profile.fullName}</div>
      </DirectoryPath>

      <HeaderBlock className="d-flex flex-wrap justify-content-between">
        <CircleImage className="me-2">
          <img
            src={`https://malegislature.gov/Legislators/Profile/170/${profile.memberId}.jpg`}
            alt={""}
            className={`image`}
          />
        </CircleImage>
        <Col>
          <Col className="d-flex" xs="6" sm="12">
            <links.External
              href={`https://malegislature.gov/Legislators/Profile/${profile.memberId}`}
              className="text-decoration-none"
            >
              <HeaderName>{profile.fullName}</HeaderName>
            </links.External>
          </Col>

          <RoleLine>
            {branch == "Senate" ? (
              <span>{t("stateSenator")}</span>
            ) : (
              <span>{t("stateRepresentative")}</span>
            )}
            <span className="px-2">·</span>
            {district}
          </RoleLine>

          <div>{party}</div>

          <SocialLine>
            {profile.email ? (
              <div>
                {/** fix mailto: on live **/}
                <links.External
                  href="mailto:#"
                  className="text-decoration-none"
                >
                  {profile.email}
                </links.External>
                <span className="px-2">·</span>
              </div>
            ) : (
              <></>
            )}

            {/** need profile prop for personal webpage to replace email placeholder **/}
            {profile.email ? (
              <div>
                <links.External href="#" className="text-decoration-none">
                  {/** need profile prop for personal webpage **/}
                  janedoe.com
                </links.External>
                <span className="px-2">·</span>
              </div>
            ) : (
              <></>
            )}

            {phoneNumber ? (
              <div>
                <PhoneNum>{formatPhoneNumber(phoneNumber)}</PhoneNum>
                <span className="px-2">·</span>
              </div>
            ) : (
              <></>
            )}

            <div>
              {profile?.social?.twitter ? (
                <a
                  href={profile.social.twitter}
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

              {profile?.social?.linkedIn ? (
                <a
                  href={profile.social.linkedIn}
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

              {profile?.social?.blueSky ? (
                <a
                  href={profile?.social?.blueSky}
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

              <FontAwesomeIcon
                icon={faAddressBook}
                style={{ color: "#1a3185" }}
              />
            </div>
          </SocialLine>
        </Col>
        <Col className="col-2">
          <div className="">Buttons</div>
        </Col>
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
            <StatNum>
              {sponsoredBills?.length ? <>{sponsoredBills.length}</> : <>?</>}
            </StatNum>
            <StatLine>{t("billsSponsored")}</StatLine>
          </Col>
        </StatBlock>
        <StatBlock>
          <Col className="flex-grow-0 mx-auto">
            <StatNum>
              {cosponsoredBills?.length ? (
                <>{cosponsoredBills.length}</>
              ) : (
                <>?</>
              )}
            </StatNum>
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
          <LegislatorSidebar />
        </Col>
      </Row>
    </Container>
  )
}
