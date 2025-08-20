import { doc, getDoc } from "firebase/firestore"
import { useTranslation } from "next-i18next"
import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { CommitteeButton } from "./HearingDetails"
import { firestore } from "components/firebase"
import * as links from "components/links"
import { LabeledIcon } from "components/shared"
import { bill } from "stories/organisms/billDetail/MockBillData"

interface Doc {
  BillNumber: string
  Title: string
}

interface Legislator {
  Details: string
  GeneralCourtNumber: number
  MemberCode: string
}

interface Members {
  id: string
  name: string
}

const SidebarBody = styled.div`
  background-color: white;
`

const SidebarBottom = styled.div`
  background-color: white;
  border-bottom-left-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
  height: 11px;
`

const SidebarHeader = styled.div`
  background-color: #c0c4dc;
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
  padding-top: 9px;
`

const SidebarSubbody = styled.div`
  font-size: 0.85rem;
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

  const [houseChairName, setHouseChairName] = useState<string>("")
  const [houseChairperson, setHouseChairperson] = useState<Legislator>()
  const [members, setMembers] = useState<Members[]>()
  const [senateChairName, setSenateChairName] = useState<string>("")
  const [senateChairperson, setSenateChairperson] = useState<Legislator>()
  const [showMembers, setShowMembers] = useState(false)

  const toggleMembers = () => {
    setShowMembers(!showMembers)
  }

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

    const memberData: Members[] = docData?.members ?? []

    const houseMembers =
      docData?.content?.HouseChairperson?.MemberCode ?? "Default Code"
    const houseMember =
      memberData.find(member => member.id === houseMembers) ?? "Default Member"
    let houseName = "Default Name"
    if (houseMember != "Default Member") {
      houseName = houseMember.name
    }

    const senateMembers =
      docData?.content?.SenateChairperson?.MemberCode ?? "Default Code"
    const senateMember =
      memberData.find(member => member.id === senateMembers) ?? "Default Member"
    let senateName = "Default Name"
    if (senateMember != "Default Member") {
      senateName = senateMember.name
    }

    setHouseChairName(houseName)
    setSenateChairName(senateName)
    setMembers(memberData)
  }, [committeeCode, generalCourtNumber])

  useEffect(() => {
    committeeCode && generalCourtNumber ? CommitteeData() : null
  }, [committeeCode, CommitteeData, generalCourtNumber])

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
        <SidebarBody className={`border-top fs-6 fw-bold px-3 py-3`}>
          {t("committee_members")}
          <SidebarSubbody className={`mb-1 mt-2`}>
            {t("chairs")}
            <div>
              {houseChairperson && (
                <LabeledIcon
                  idImage={`https://malegislature.gov/Legislators/Profile/170/${houseChairperson.MemberCode}.jpg`}
                  mainText={`House Chair`}
                  subText={
                    <links.External
                      href={`https://malegislature.gov/Legislators/Profile/${houseChairperson.MemberCode}`}
                    >
                      {houseChairName}
                    </links.External>
                  }
                />
              )}
            </div>
            <div>
              {senateChairperson && (
                <LabeledIcon
                  idImage={`https://malegislature.gov/Legislators/Profile/170/${senateChairperson.MemberCode}.jpg`}
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

            {members ? (
              <>
                <div className={`d-flex justify-content-end mb-2`}>
                  <CommitteeButton
                    className={`btn btn-secondary d-flex text-nowrap mt-1 mx-1 p-1`}
                    onClick={toggleMembers}
                  >
                    &nbsp; {showMembers ? "Show less" : "Show more"} &nbsp;
                  </CommitteeButton>
                </div>

                {showMembers ? (
                  <>
                    {t("members")}
                    <div>
                      {members.map((member: Members, index: number) => {
                        if (
                          member.name !== houseChairName &&
                          member.name !== senateChairName
                        ) {
                          return (
                            <LabeledIcon
                              key={index}
                              idImage={`https://malegislature.gov/Legislators/Profile/170/${member.id}.jpg`}
                              mainText={`Member`}
                              subText={
                                <links.External
                                  href={`https://malegislature.gov/Legislators/Profile/${member.id}`}
                                >
                                  {member.name}
                                </links.External>
                              }
                            />
                          )
                        }
                      })}
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <></>
            )}
          </SidebarSubbody>
        </SidebarBody>
      )}
      <SidebarBottom />
    </>
  )
}
