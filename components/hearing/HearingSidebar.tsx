import { doc, getDoc } from "firebase/firestore"
import { useTranslation } from "next-i18next"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import type { ModalProps } from "react-bootstrap"
import styled from "styled-components"
import Papa from "papaparse"
import { Col, Image, Modal, Row } from "../bootstrap"
import { firestore } from "../firebase"
import * as links from "../links"
import { billSiteURL, Internal } from "../links"
import { LabeledIcon } from "../shared"
import { Paragraph, formatMilliseconds } from "./hearing"

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

function MemberItem({
  generalCourtNumber,
  member
}: {
  generalCourtNumber: string
  member: Members
}) {
  const [branch, setBranch] = useState<string>("")

  const memberData = useCallback(async () => {
    const memberList = await getDoc(
      doc(firestore, `generalCourts/${generalCourtNumber}/members/${member.id}`)
    )
    const docData = memberList.data()

    setBranch(docData?.content.Branch)
  }, [])

  useEffect(() => {
    memberData()
  }, [])

  return (
    <LabeledIcon
      idImage={`https://malegislature.gov/Legislators/Profile/170/${member.id}.jpg`}
      mainText={branch}
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

const BillsBody = styled.div`
  background-color: white;
  max-height: 672px;
  overflow-y: auto;

  @media (max-width: 1400px) {
    max-height: 605px;
  }

  @media (max-width: 1200px) {
    max-height: 537px;
  }

  @media (max-width: 992px) {
    max-height: 471px;
  }
`

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
  hearingDate,
  hearingId,
  transcriptData
}: {
  billsInAgenda: any[] | null
  committeeCode: string | null
  generalCourtNumber: string | null
  hearingDate: string | null
  hearingId: string
  transcriptData: Paragraph[] | null
}) => {
  const { t } = useTranslation(["common", "hearing"])

  const dateObject = hearingDate ? new Date(hearingDate) : null
  const formattedDate = dateObject
    ? dateObject.toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric"
      })
    : null
  let dateCheck = false
  if (formattedDate && formattedDate !== `Invalid Date`) {
    dateCheck = true
  }

  const [downloadName, setDownloadName] = useState<string>("hearing.csv")
  const [downloadURL, setDownloadURL] = useState<string>("")
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
    setDownloadName(`hearing-${hearingId}.csv`)
  }, [hearingId])

  useEffect(() => {
    if (!transcriptData) return
    const csv_objects = transcriptData.map(doc => ({
      start: formatMilliseconds(doc.start),
      text: doc.text
    }))
    const csv = Papa.unparse(csv_objects)
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    setDownloadURL(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [transcriptData])

  useEffect(() => {
    committeeCode && generalCourtNumber ? committeeData() : null
  }, [committeeCode, committeeData, generalCourtNumber])

  let billsArray: [string, string | number][] = []
  // convert object to array because
  // Objects are not valid as a React child
  if (billsInAgenda) {
    billsArray = Object.values(billsInAgenda)
  }

  return (
    <>
      <SidebarHeader className={`fs-6 fw-bold mt-4 px-3 pb-2`}>
        {t("hearing_details", { ns: "hearing" })}
      </SidebarHeader>

      {dateCheck || downloadURL !== "" ? (
        <SidebarBody className={`border-bottom fs-6 px-3 py-3`}>
          {dateCheck ? (
            <>
              <SidebarSubbody className={`mb-1 fw-bold`}>
                {t("recording_date", { ns: "hearing" })}
              </SidebarSubbody>
              {formattedDate}
            </>
          ) : (
            <></>
          )}
          {downloadURL !== "" ? (
            <div>
              <a
                href={downloadURL}
                download={downloadName}
                className="text-blue-600 underline"
              >
                {t("download_transcript", { ns: "hearing" })}
              </a>
            </div>
          ) : (
            <></>
          )}
        </SidebarBody>
      ) : (
        <></>
      )}

      {committeeCode && generalCourtNumber && (
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
                      {members.map((member: Members) => {
                        if (
                          member.name !== houseChairName &&
                          member.name !== senateChairName
                        ) {
                          return (
                            <MemberItem
                              key={member.id}
                              generalCourtNumber={generalCourtNumber}
                              member={member}
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
        <BillsBody className={`border-bottom border-top fs-6 px-3 py-3`}>
          <div className={`fw-bold`}>
            {t("bills_consideration", { ns: "hearing" })} (
            {billsInAgenda.length})
          </div>
          {billsArray.map((element: any) => (
            <AgendaBill
              key={element.BillNumber}
              element={element}
              committeeCode={committeeCode}
              generalCourtNumber={generalCourtNumber}
            />
          ))}
        </BillsBody>
      )}
      <SidebarBottom className={`border-top`} />
    </>
  )
}

function AgendaBill({
  committeeCode,
  element,
  generalCourtNumber
}: {
  committeeCode: string | null
  element: Bill
  generalCourtNumber: string | null
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

  return (
    <>
      <div className={`border border-2 my-3 rounded`}>
        <div className={`m-2`}>
          <Internal href={billSiteURL(BillNumber, CourtNumber)}>
            {BillNumber}
          </Internal>
          <SidebarSubbody className={`my-2`}>{element.Title}</SidebarSubbody>
          {committeeActions[0]?.Votes[0]?.Question ? (
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
        generalCourtNumber={generalCourtNumber}
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
  generalCourtNumber: string | null
  onSettingsModalClose: () => void
}

function VotesModal({
  BillNumber,
  committeeActions,
  CourtNumber,
  generalCourtNumber,
  onHide,
  onSettingsModalClose,
  show
}: Props) {
  const { t } = useTranslation(["common", "editProfile", "hearing"])

  return (
    <Modal show={show} onHide={onHide} aria-labelledby="votes-modal" centered>
      <Modal.Header className={`px-3 py-1`}>
        <Modal.Title id="votes-modal">
          {BillNumber} {t("votes", { ns: "hearing" })}
        </Modal.Title>
        <Image
          src="/x_cancel.png"
          alt={t("navigation.closeNavMenu", { ns: "editProfile" })}
          width="25"
          height="25"
          className="ms-2"
          onClick={onSettingsModalClose}
        />
      </Modal.Header>
      <Modal.Body className={`bg-white p-3`}>
        <div className={`fw-bold`}>
          {committeeActions[0]?.Votes[0]?.Question}
        </div>
        <ModalLine />
        <div className={`fw-bold`}>
          {t("yes", { ns: "hearing" })} (
          {committeeActions[0]?.Votes[0]?.Vote[0]?.Favorable.length})
        </div>
        {generalCourtNumber &&
          committeeActions[0]?.Votes[0]?.Vote[0]?.Favorable.map(
            (element: any, index: number) => (
              <Vote
                key={index}
                element={element}
                generalCourtNumber={generalCourtNumber}
                value={`yes`}
              />
            )
          )}

        <div className={`fw-bold`}>
          {t("no", { ns: "hearing" })} (
          {committeeActions[0]?.Votes[0]?.Vote[0]?.Adverse.length})
        </div>
        {generalCourtNumber &&
          committeeActions[0]?.Votes[0]?.Vote[0]?.Adverse.map(
            (element: any, index: number) => (
              <Vote
                key={index}
                element={element}
                generalCourtNumber={generalCourtNumber}
                value={`no`}
              />
            )
          )}

        <div className={`fw-bold`}>
          {t("no_vote", { ns: "hearing" })} (
          {committeeActions[0]?.Votes[0]?.Vote[0]?.NoVoteRecorded.length})
        </div>
        {generalCourtNumber &&
          committeeActions[0]?.Votes[0]?.Vote[0]?.NoVoteRecorded.map(
            (element: any, index: number) => (
              <Vote
                key={index}
                element={element}
                generalCourtNumber={generalCourtNumber}
                value={`no_record`}
              />
            )
          )}

        <div className={`fw-bold`}>
          {t("reserve_right", { ns: "hearing" })} (
          {committeeActions[0]?.Votes[0]?.Vote[0]?.ReserveRight.length})
        </div>
        {generalCourtNumber &&
          committeeActions[0]?.Votes[0]?.Vote[0]?.ReserveRight.map(
            (element: any, index: number) => (
              <Vote
                key={index}
                element={element}
                generalCourtNumber={generalCourtNumber}
                value={`reserve`}
              />
            )
          )}

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

const VoteRow = styled.div`
  &:nth-child(even) {
    background-color: #eae7e7;
  &:nth-child(odd) {
    background-color: white;
  }
`

const VoteValue = styled.div`
  width: 80px;
`

function Vote({
  element,
  generalCourtNumber,
  value
}: {
  element: any
  generalCourtNumber: string
  value: string
}) {
  const { t } = useTranslation(["common", "hearing"])
  const [branch, setBranch] = useState<string>("")
  const [memberName, setMemberName] = useState<string>("")
  const [party, setParty] = useState<string>("")

  const memberData = useCallback(async () => {
    const memberList = await getDoc(
      doc(
        firestore,
        `generalCourts/${generalCourtNumber}/members/${element.MemberCode}`
      )
    )
    const docData = memberList.data()

    setBranch(docData?.content.Branch)
    setMemberName(docData?.content.Name)
    setParty(docData?.content.Party)
  }, [])

  useEffect(() => {
    memberData()
  }, [])

  return (
    <VoteRow className={`d-flex justify-content-between`}>
      <VoteValue className={`ms-4`}>{t(value, { ns: "hearing" })}</VoteValue>
      <Col className={`d-block justify-content-start `} xs={5}>
        <Row>
          <links.External
            href={`https://malegislature.gov/Legislators/Profile/${element.MemberCode}`}
          >
            {memberName}
          </links.External>
        </Row>
        <Row className={`ps-4`}>
          <em>{party}</em>
        </Row>
      </Col>
      <div className={`me-4`}>{branch}</div>
    </VoteRow>
  )
}
