import { parseISO, format } from "date-fns"
import { doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/router"
import { Trans, useTranslation } from "next-i18next"
import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { Col, Container, Image, Row } from "../bootstrap"
import { Transcriptions } from "./Transcriptions"
import { firestore } from "components/firebase"
import * as links from "components/links"
import { LabeledIcon } from "components/shared"

const SidebarBody = styled.div`
  background-color: white;
`

const SidebarSubbody = styled.div`
  font-size: 0.85rem;
`

const SidebarHeader = styled.div`
  background-color: #c0c4dc;
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
  padding-top: 9px;
`

export const HearingSidebar = ({
  committeeCheck,
  committeeCode,
  generalCourtNumber,
  hearingDate
}: {
  committeeCheck: boolean
  committeeCode: string
  generalCourtNumber: string
  hearingDate: string
}) => {
  const { t } = useTranslation("common")

  const dateObject = new Date(hearingDate)
  const formattedDate = dateObject.toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric"
  })

  console.log("C Code: ", committeeCode)

  interface Members {
    id: string
    name: string
  }

  interface Legislator {
    Details: string
    GeneralCourtNumber: number
    MemberCode: string
  }

  const [houseChairName, setHouseChairName] = useState<string>("")
  const [houseChairperson, setHouseChairperson] = useState<Legislator>()
  const [senateChairName, setSenateChairName] = useState<string>("")
  const [senateChairperson, setSenateChairperson] = useState<Legislator>()

  const CommitteeData = useCallback(async () => {
    const committee = await getDoc(
      doc(
        firestore,
        `generalCourts/${generalCourtNumber}/committees/${committeeCode}`
      )
    )
    const docData = committee.data()

    setHouseChairperson(docData?.content.HouseChairperson)
    setSenateChairperson(docData?.content.SenateChairperson)

    const members: Members[] = docData?.members ?? []

    const houseMembers =
      docData?.content?.HouseChairperson?.MemberCode ?? "Default Code"
    const houseMember =
      members.find(member => member.id === houseMembers) ?? "Default Member"
    let houseName = "Default Name"
    if (houseMember != "Default Member") {
      houseName = houseMember.name
    }

    const senateMembers =
      docData?.content?.SenateChairperson?.MemberCode ?? "Default Code"
    const senateMember =
      members.find(member => member.id === senateMembers) ?? "Default Member"
    let senateName = "Default Name"
    if (senateMember != "Default Member") {
      senateName = senateMember.name
    }

    setHouseChairName(houseName)
    setSenateChairName(senateName)

    console.log("Comm data: ", docData)
  }, [committeeCode, generalCourtNumber])

  useEffect(() => {
    committeeCode && generalCourtNumber ? CommitteeData() : null
  }, [committeeCode, CommitteeData, generalCourtNumber])

  console.log("H Chair: ", houseChairperson)
  console.log("H Name: ", houseChairName)
  console.log("S Chair: ", senateChairperson?.MemberCode)
  console.log("S Name: ", senateChairName)

  return (
    <>
      <SidebarHeader className={`fs-6 fw-bold px-3 pb-2`}>
        {t("hearing_details")}
      </SidebarHeader>
      <SidebarBody className={`border-bottom fs-6 fw-bold px-3 py-3`}>
        <SidebarSubbody className={`mb-1`}>
          {t("recording_date")}
        </SidebarSubbody>
        <div className={`fw-normal`}>{formattedDate}</div>
      </SidebarBody>
      {committeeCheck && (
        <SidebarBody
          className={`border-top fs-6 fw-bold px-3 py-3`}
          style={{
            borderBottomLeftRadius: "0.75rem",
            borderBottomRightRadius: "0.75rem"
          }}
          // style is temporary until next section is complete
        >
          {t("committee_members")}
          <SidebarSubbody className={`mb-1 mt-2`}>
            {t("chairs")}
            <div>
              {houseChairperson && (
                <LabeledIcon
                  idImage={`https://malegislature.gov/Legislators/Profile/170/${houseChairperson.MemberCode}.jpg`}
                  // mainText={t("leadSponsor")}
                  mainText={`House Chair`}
                  subText={
                    <links.External
                      href={`https://malegislature.gov/Legislators/Profile/${houseChairperson.MemberCode}`}
                    >
                      {senateChairName}
                    </links.External>
                  }
                />
              )}
            </div>
            <div>
              {senateChairperson && (
                <LabeledIcon
                  idImage={`https://malegislature.gov/Legislators/Profile/170/${senateChairperson.MemberCode}.jpg`}
                  // mainText={t("leadSponsor")}
                  mainText={`Senate Chair`}
                  subText={
                    <links.External
                      href={`https://malegislature.gov/Legislators/Profile/${senateChairperson.MemberCode}`}
                    >
                      {senateChairName}
                    </links.External>
                  }
                />
              )}
            </div>
          </SidebarSubbody>
        </SidebarBody>
      )}
    </>
  )
}
