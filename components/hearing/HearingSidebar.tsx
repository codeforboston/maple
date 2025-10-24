import { doc, getDoc } from "firebase/firestore"
import { useTranslation } from "next-i18next"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import type { ModalProps } from "react-bootstrap"
import styled from "styled-components"
import { Col, Form, Image, Modal, Row } from "../bootstrap"
import { firestore } from "../firebase"
import * as links from "../links"
import { billSiteURL, Internal } from "../links"
import { LabeledIcon } from "../shared"

type Bill = {
  BillNumber: string
  Details: string
  GeneralCourtNumber: number
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

const ModalLine = styled.hr`
  border-color: #000000;
  border-style: solid;
  border-width: 1px;
  opacity: 0.1;
`

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

    const houseChairCode = docData?.content?.HouseChairperson?.MemberCode
    const houseChair = memberData.find(member => member.id === houseChairCode)
    let houseChairName = ""
    houseChair && (houseChairName = houseChair.name)

    const senateChairCode = docData?.content?.SenateChairperson?.MemberCode
    const senateChair = memberData.find(member => member.id === senateChairCode)
    let senateChairName = ""
    senateChair && (senateChairName = senateChair.name)

    setHouseChairName(houseChairName)
    setSenateChairName(senateChairName)
    setMembers(memberData)
  }, [committeeCode, generalCourtNumber])

  useEffect(() => {
    committeeCode && generalCourtNumber ? committeeData() : null
  }, [committeeCode, committeeData, generalCourtNumber])

  let billsArray: [string, string | number][] = []
  // convert object to array because
  // Objects are not valid as a React child
  if (billsInAgenda) {
    billsArray = Object.values(billsInAgenda)
  }

  console.log("Members: ", members)
  console.log("Bills: ", billsArray)
  console.log("CommCode: ", committeeCode)

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
                  <button
                    className={`bg-transparent border-0 d-flex text-nowrap text-secondary mt-1 mx-1 p-1`}
                    onClick={toggleMembers}
                  >
                    <u>
                      {showMembers
                        ? t("see_less", { ns: "hearing" })
                        : t("see_all", { ns: "hearing" })}
                    </u>
                  </button>
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
            {t("bills_consideration", { ns: "hearing" })} (
            {billsInAgenda.length})
          </div>
          {billsArray.map((element: any) => (
            <AgendaBill
              key={element.BillNumber}
              element={element}
              committeeCode={committeeCode}
            />
          ))}
        </SidebarBody>
      )}
      <SidebarBottom className={`border-top`} />
    </>
  )
}

function AgendaBill({
  committeeCode,
  element
}: {
  committeeCode: string
  element: Bill
}) {
  const { t } = useTranslation(["common", "hearing"])
  const BillNumber = element.BillNumber
  const CourtNumber = element.GeneralCourtNumber
  const [committeeRecommendations, setCommitteeRecommendations] = useState<any>(
    []
  )
  const [settingsModal, setSettingsModal] = useState<"show" | null>(null)

  const close = () => setSettingsModal(null)

  const hearingBill = useCallback(async () => {
    const bill = await getDoc(
      doc(firestore, `generalCourts/${CourtNumber}/bills/${BillNumber}`)
    )
    const docData = bill.data()

    setCommitteeRecommendations(docData?.content.CommitteeRecommendations)
  }, [BillNumber, CourtNumber])

  useEffect(() => {
    BillNumber && CourtNumber ? hearingBill() : null
  }, [BillNumber, hearingBill, CourtNumber])

  let committeeActions = []

  committeeRecommendations
    ? (committeeActions = committeeRecommendations.filter(
        (action: any) => action.Committee.CommitteeCode === committeeCode
      ))
    : null

  console.log("Recs (all committees): ", committeeRecommendations)
  console.log("Actions (only this hearing's committee): ", committeeActions)

  return (
    <>
      <div className={`border border-2 my-3 rounded`}>
        <div className={`m-2`}>
          <Internal href={billSiteURL(BillNumber, CourtNumber)}>
            {BillNumber}
          </Internal>
          <SidebarSubbody className={`my-2`}>{element.Title}</SidebarSubbody>
          {committeeActions.length ? (
            <SidebarSubbody className={`d-flex justify-content-end mb-2`}>
              <button
                className={`bg-transparent border-0 d-flex text-nowrap text-secondary mt-1 mx-1 p-1`}
                onClick={() => setSettingsModal("show")}
              >
                <u>{t("view_votes", { ns: "hearing" })}</u>
              </button>
            </SidebarSubbody>
          ) : (
            <></>
          )}
        </div>
      </div>
      <VotesModal
        BillNumber={BillNumber}
        committeeActions={committeeActions}
        CourtNumber={CourtNumber}
        onHide={close}
        onSettingsModalClose={() => setSettingsModal(null)}
        show={settingsModal === "show"}
      />
    </>
  )
}

type Props = Pick<ModalProps, "show" | "onHide"> & {
  BillNumber: string
  committeeActions: any
  CourtNumber: number
  onSettingsModalClose: () => void
}

function VotesModal({
  BillNumber,
  committeeActions,
  CourtNumber,
  onHide,
  onSettingsModalClose,
  show
}: Props) {
  const { t } = useTranslation(["common", "editProfile", "hearing"])

  console.log("Actions:", committeeActions[0]?.Action)

  return (
    <Modal show={show} onHide={onHide} aria-labelledby="votes-modal" centered>
      <Modal.Header>
        <Modal.Title id="votes-modal">
          {BillNumber} {t("votes", { ns: "hearing" })}
        </Modal.Title>
        <Image
          src="/x_cancel.png"
          alt={t("navigation.closeNavMenu", { ns: "editProfile" })}
          width="30"
          height="30"
          className="ms-2"
          onClick={onSettingsModalClose}
        />
      </Modal.Header>
      <Modal.Body className={`p-3`}>
        <ModalLine />

        {/* <div className={`fw-bold`}>{t("yes", { ns: "hearing" })} ()</div>
        <div className={`fw-bold`}>{t("no", { ns: "hearing" })} ()</div>
        <div className={`fw-bold`}>{t("no_action", { ns: "hearing" })} ()</div> */}

        {committeeActions.map((element: any, index: number) => (
          <ActionItem key={index} element={element} />
        ))}

        <ModalLine />
        <div className={`d-flex fs-6 justify-content-end`}>
          <Link
            href={`/bills/${CourtNumber}/${BillNumber}`}
            className={`fw-bold justify-content-end link-underline link-underline-opacity-0`}
          >
            {t("view_bill", { ns: "hearing" })} &rarr;
          </Link>
        </div>
      </Modal.Body>
    </Modal>
  )
}

function ActionItem({ element }: { element: any }) {
  const { t } = useTranslation(["common", "hearing"])

  return (
    <div className={`fw-bold`}>
      {t("action", { ns: "hearing" })}
      {`:`} {element.Action}
    </div>
  )
}
