import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import ErrorPage from "next/error"
import { useTranslation } from "next-i18next"
import styled from "styled-components"

import * as links from "../links"

import {
  Bluesky,
  DistrictLabel,
  formatPhoneNumber,
  LinkedIn,
  PartyLabel,
  Twitter
} from "./LegislatorComponents"
// import { LegislatorSidebar } from "./SidebarComponents/LegislatorSidebar"
import { LegislatorTabs } from "./LegislatorTabs"

import { useAuth } from "components/auth"
import { Col, Container, Row, Spinner } from "components/bootstrap"
import { useDistrict, useMember } from "components/db"
import { Internal } from "components/links"
import { FollowUserButton } from "components/shared/FollowButton"
import { CircleImage } from "components/shared/LabeledIcon"

type ProfilePlaceholder = {
  social?: {
    blueSky?: string
    linkedIn?: string
    twitter?: string
  }
  website?: string
}

const tabs = [
  "Priorities",
  "Bills",
  "Elections",
  "Finance",
  "District",
  "Her testimony",
  "Votes"
]

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

// const TabButton = styled.button`
//   background: transparent;
//   border: 0;
//   border-bottom: 5px solid transparent;
//   color: #68707a;
//   font-size: 1.35rem;
//   font-weight: 700;
//   padding: 1.35rem 1.9rem 1.15rem;

//   &.active {
//     border-bottom-color: #18358f;
//     color: #18358f;
//   }
// `

export function LegislatorProfilePage({
  court,
  memberCode
}: {
  court: number
  memberCode: string
}) {
  const { member, loading: memberLoading } = useMember(court, memberCode)
  const { district, loading: districtLoading } = useDistrict(
    court,
    member?.Branch,
    member?.District
  )
  const { t } = useTranslation("legislators")
  // const { user } = useAuth() **uncomment when Following Button in enabled**

  /* replace with profile info for legislators with Maple accounts */
  let profile: ProfilePlaceholder = {
    // social: {
    //   blueSky: "blueskyTest",
    //   linkedIn: "linkedinTest",
    //   twitter: "twitterTest"
    // },
    // website: "test.com"
    social: {
      blueSky: "",
      linkedIn: "",
      twitter: ""
    },
    website: ""
  }

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

  console.log("district: ", district)

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

            {profile.website ? (
              <div>
                <span className="px-2">·</span>
                <links.External
                  href={`https://${profile.website}`}
                  className="text-decoration-none"
                >
                  {profile.website}
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
              {profile?.social?.twitter ||
              profile?.social?.linkedIn ||
              profile?.social?.blueSky ? (
                <span className="px-2">·</span>
              ) : (
                <></>
              )}

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
                  href={profile?.social.blueSky}
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
            </div>
          </SocialLine>
        </Col>

        <ButtonContainer>
          {/* uncomment when legislator Maple accounts are linked to this page 
          
          {user && legislatorAccountId ? (
            <div className="mb-2">
              <FollowUserButton profileId={props.id} />
            </div>
          ) : (
            <></>
          )} */}
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

      <Row>
        <Col className={`mt-4`} md="9">
          <LegislatorTabs
            district={district}
            districtLoading={districtLoading}
          />
        </Col>
        <Col className={`mt-4`} md="3">
          {/* <LegislatorSidebar /> */}
          <div>Sidebar</div>
        </Col>
      </Row>

      {/* <div
        className="d-flex justify-content-between border-bottom mb-4 overflow-auto"
        role="tablist"
        aria-label="Legislator profile sections"
      >
        {tabs.map(label => (
          <TabButton
            key={label}
            type="button"
            role="tab"
            aria-selected={label === "District"}
            className={label === "District" ? "active" : undefined}
            disabled={label !== "District"}
          >
            {label}
          </TabButton>
        ))}
      </div>
      <div role="tabpanel">
        <DistrictTab district={district} loading={districtLoading} />
      </div> */}
    </Container>
  )
}
