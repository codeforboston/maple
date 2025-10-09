import { doc, getDoc } from "firebase/firestore"
import { useTranslation } from "next-i18next"
import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { CommitteeButton } from "./HearingDetails"
import { firestore } from "components/firebase"
import * as links from "components/links"
import { LabeledIcon } from "components/shared"

interface Legislator {
  Details: string
  GeneralCourtNumber: number
  MemberCode: string
}

interface Members {
  id: string
  name: string
}

const SeeMembersButton = styled.button``

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
  billsInAgenda,
  committeeCode,
  generalCourtNumber,
  hearingDate
}: {
  billsInAgenda: never[]
  committeeCode: string
  generalCourtNumber: string
  hearingDate: string
}) => {
  const { t } = useTranslation(["common", "hearing"])

  const dateObject = new Date(hearingDate)
  const formattedDate = dateObject.toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric"
  })
  let dateCheck = false
  if (formattedDate !== `Invalid Date`) {
    dateCheck = true
  }

  const [houseChairName, setHouseChairName] = useState<string>("")
  const [houseChairperson, setHouseChairperson] = useState<Legislator>()
  const [members, setMembers] = useState<Members[]>()
  const [senateChairName, setSenateChairName] = useState<string>("")
  const [senateChairperson, setSenateChairperson] = useState<Legislator>()
  const [showMembers, setShowMembers] = useState(false)

  const toggleMembers = () => {
    setShowMembers(!showMembers)
  }

  const committeeData = useCallback(async () => {
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

    const houseMembers = docData?.content?.HouseChairperson?.MemberCode
    const houseMember = memberData.find(member => member.id === houseMembers)
    let houseName = ""
    houseMember && (houseName = houseMember.name)

    const senateMembers = docData?.content?.SenateChairperson?.MemberCode
    const senateMember = memberData.find(member => member.id === senateMembers)
    let senateName = ""
    senateMember && (senateName = senateMember.name)

    setHouseChairName(houseName)
    setSenateChairName(senateName)
    setMembers(memberData)
  }, [committeeCode, generalCourtNumber])

  useEffect(() => {
    committeeCode && generalCourtNumber ? committeeData() : null
  }, [committeeCode, committeeData, generalCourtNumber])

  console.log("Bills: ", billsInAgenda)

  return (
    <>
      <SidebarHeader className={`fs-6 fw-bold px-3 pb-2`}>
        {t("hearing_details", { ns: "hearing" })}
      </SidebarHeader>

      {dateCheck ? (
        <SidebarBody className={`border-bottom fs-6 fw-bold px-3 py-3`}>
          <SidebarSubbody className={`mb-1`}>
            {t("recording_date", { ns: "hearing" })}
          </SidebarSubbody>
          <div className={`fw-normal`}>{formattedDate}</div>
        </SidebarBody>
      ) : (
        <></>
      )}

      {committeeCode && (
        <SidebarBody
          className={`border-bottom border-top fs-6 fw-bold px-3 py-3`}
        >
          {t("committee_members", { ns: "hearing" })}
          <SidebarSubbody className={`mb-1 mt-2`}>
            {t("chairs", { ns: "hearing" })}
            <div>
              {houseChairperson && (
                <LabeledIcon
                  idImage={`https://malegislature.gov/Legislators/Profile/170/${houseChairperson.MemberCode}.jpg`}
                  mainText={t("house_chair", { ns: "hearing" })}
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
                  mainText={t("senate_chair", { ns: "hearing" })}
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
                <div className={`d-flex fs-6 justify-content-end mb-2`}>
                  <SeeMembersButton
                    className={`bg-transparent border-0 d-flex text-nowrap text-secondary mt-1 mx-1 p-1`}
                    onClick={toggleMembers}
                  >
                    <u>
                      {showMembers
                        ? t("see_less", { ns: "hearing" })
                        : t("see_all", { ns: "hearing" })}
                    </u>
                  </SeeMembersButton>
                </div>

                {showMembers ? (
                  <>
                    {t("members", { ns: "hearing" })}
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
                              mainText={t("member", { ns: "hearing" })}
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
      {billsInAgenda && (
        <SidebarBody className={`border-bottom border-top fs-6 px-3 py-3`}>
          <div className={`fw-bold`}>
            Bills under consideration ({billsInAgenda.length})
          </div>
          <div className={`fw-normal`}>Ordered by appearance in hearing</div>
        </SidebarBody>
      )}
      <SidebarBottom className={`border-top`} />
    </>
  )
}
