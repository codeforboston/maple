import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query
} from "firebase/firestore"
import { useRouter } from "next/router"
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

export const HearingDetails = ({
  hearingId
}: {
  hearingId: string | string[] | undefined
}) => {
  const { t } = useTranslation("common")
  const hearingQuery = `hearing-${hearingId}`

  console.log("hearing id: ", hearingId)
  console.log("Q: ", hearingQuery)

  const [committeeCode, setCommitteeCode] = useState("")
  const [committeeName, setCommitteeName] = useState("")
  const [generalCourtNumber, setGeneralCourtNumber] = useState("")
  const [videoTranscriptionId, setVideoTranscriptionId] = useState("")
  const [videoURL, setVideoURL] = useState("")

  const hearingData = useCallback(async () => {
    const hearing = await getDoc(doc(firestore, `events/${hearingQuery}`))
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
  }, [hearingQuery])

  useEffect(() => {
    hearingData()
  }, [hearingData])

  const router = useRouter()
  useEffect(() => {
    if (videoURL === "Default URL") {
      router.push({ pathname: "/404" })
    }
  }, [router, videoURL])

  // pathname: "/404" could possible replaced with a different
  // page/sequence/message that's more specific to the problem
  // i.e. "the hearing ID you're trying to reach is not on file,
  // please choose another"

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
