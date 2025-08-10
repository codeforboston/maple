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

const StyledContainer = styled(Container)`
  font-family: "Nunito";
`

export const HearingDetails = () => {
  const { t } = useTranslation("common")
  const hearingId = "hearing-5180"

  const [committeeName, setCommitteeName] = useState("")
  const [videoTranscriptionId, setVideoTranscriptionId] = useState("")
  const [videoURL, setVideoURL] = useState("")

  const hearingData = useCallback(async () => {
    const hearing = await getDoc(doc(firestore, `events/${hearingId}`))
    const docData = hearing.data()
    const content = docData?.content ?? "Default Content"

    setCommitteeName(content.Name)
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
  console.log("Id: ", videoTranscriptionId)
  console.log("url: ", videoURL)

  return (
    <StyledContainer className="mt-3 mb-3">
      <h1>{t("hearing_transcription")}</h1>
      <>Hello Hearing World, {videoURL}</>
    </StyledContainer>
  )
}
