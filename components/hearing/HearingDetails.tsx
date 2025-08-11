import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query
} from "firebase/firestore"
import { useTranslation } from "next-i18next"
import { useCallback, useEffect, useRef, useState } from "react"
import styled from "styled-components"
import { Col, Container, Image, Row } from "../bootstrap"
import { firestore } from "components/firebase"

import * as links from "components/links"

const StyledContainer = styled(Container)`
  font-family: "Nunito";
`

// same as SmartTagButton from bill/summary.tsx
// consolidate as a shared component when there's time in future?
const CommitteeButton = styled.button`
  border-radius: 12px;
  font-size: 12px;
`

export const HearingDetails = () => {
  const { t } = useTranslation("common")
  const hearingId = "hearing-5180"

  const [committeeCode, setCommitteeCode] = useState("")
  const [committeeName, setCommitteeName] = useState("")
  const [generalCourtNumber, setGeneralCourtNumber] = useState("")
  const [videoTranscriptionId, setVideoTranscriptionId] = useState("")
  const [videoURL, setVideoURL] = useState("")

  const hearingData = useCallback(async () => {
    const hearing = await getDoc(doc(firestore, `events/${hearingId}`))
    const docData = hearing.data()
    const content = docData?.content ?? "Default Content"

    setCommitteeCode(
      docData?.content.HearingHost.CommitteeCode ?? "Default Committee Code"
    )
    setCommitteeName(docData?.content.Name ?? "Default Name")
    setGeneralCourtNumber(
      docData?.content.HearingHost.GeneralCourtNumber ??
        "Default General Court Number"
    )
    setVideoTranscriptionId(
      docData?.videoTranscriptionId ?? "Default Video Transcripton Id"
    )
    setVideoURL(docData?.videoURL ?? "Default URL")

    console.log("data: ", docData)
    console.log("content: ", content)
  }, [])

  useEffect(() => {
    hearingData()
  }, [hearingData])

  console.log("Committee: ", committeeName)
  console.log("Committee Code: ", committeeCode)
  console.log("General Court Number", generalCourtNumber)
  console.log("Id: ", videoTranscriptionId)
  console.log("url: ", videoURL)

  return (
    <StyledContainer className="mt-3 mb-3">
      <h1>{t("hearing_transcription")}</h1>

      <links.External
        href={`https://malegislature.gov/Committees/Detail/${committeeCode}/${generalCourtNumber}`}
      >
        <CommitteeButton
          className={`btn btn-secondary d-flex text-nowrap mt-1 mx-1 p-1`}
        >
          &nbsp; {committeeName} &nbsp;
        </CommitteeButton>
      </links.External>

      <>Hello Hearing World, {videoURL}</>
    </StyledContainer>
  )
}
