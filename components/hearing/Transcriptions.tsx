import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { useTranslation } from "next-i18next"
import React, { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { Col, Container, Row } from "../bootstrap"
import { firestore } from "components/firebase"

type DocElement = {
  confidence: number
  end: number
  start: number
  text: string
}

const ErrorContainer = styled(Container)`
  background-color: white;
`

const TimestampButton = styled.button`
  border-radius: 12px;
  width: min-content;
`

const TimestampCol = styled.div`
  width: 100px;
`

const TranscriptionRow = styled(Row)`
  &:first-child {
    border-top-left-radius: 0.75rem;
    border-top-right-radius: 0.75rem;
  }
  &:nth-child(even) {
    background-color: #c0c4dc;
  }
  &:nth-child(odd) {
    background-color: white;
  }
  &:last-child {
    border-bottom-left-radius: 0.75rem;
    border-bottom-right-radius: 0.75rem;
  }
`

export const Transcriptions = ({
  setCurTimeVideo,
  videoTranscriptionId
}: {
  setCurTimeVideo: any
  videoTranscriptionId: string
}) => {
  const { t } = useTranslation("common")

  const subscriptionRef = collection(
    firestore,
    `transcriptions/${videoTranscriptionId}/paragraphs`
  )

  const [transcriptData, setTranscriptData] = useState<DocElement[]>([])

  const transcriptionData = useCallback(async () => {
    let docList: any[] = []

    const q = query(subscriptionRef, orderBy("start"))
    const querySnapshot = await getDocs(q)

    querySnapshot.forEach(doc => {
      // doc.data() is never undefined for query doc snapshots
      docList.push(doc.data())
    })

    if (transcriptData.length === 0 && docList.length != 0) {
      setTranscriptData(docList)
    }
  }, [subscriptionRef, transcriptData])

  useEffect(() => {
    transcriptionData()
  }, [transcriptionData])

  return (
    <>
      {transcriptData.length > 0 ? (
        <Container className={`mb-2`}>
          {transcriptData.map((element: DocElement, index: number) => (
            <TranscriptItem
              key={index}
              element={element}
              setCurTimeVideo={setCurTimeVideo}
            />
          ))}
        </Container>
      ) : (
        <ErrorContainer className={`fs-6 fw-bold mb-2 py-2 rounded`}>
          <div>{t("transcription_not_on_file")}</div>
        </ErrorContainer>
      )}
    </>
  )
}

function TranscriptItem({
  element,
  setCurTimeVideo
}: {
  element: DocElement
  setCurTimeVideo: any
}) {
  const handleClick = (val: number) => {
    const valSeconds = val / 1000
    /* data from backend is in milliseconds
     
       needs to be converted to seconds to 
       set currentTime property of <video> element */

    setCurTimeVideo(valSeconds)
  }

  const formatMilliseconds = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const formattedHours = String(hours).padStart(2, "0")
    const formattedMinutes = String(minutes).padStart(2, "0")
    const formattedSeconds = String(seconds).padStart(2, "0")

    if (hours >= 1) {
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
    } else {
      return `${formattedMinutes}:${formattedSeconds}`
    }
  }

  return (
    <TranscriptionRow>
      <TimestampCol>
        <Row className={`d-inline`}>
          <TimestampButton
            onClick={() => {
              handleClick(element.start)
            }}
            className={`btn btn-secondary text-nowrap m-1 p-1`}
            type="button"
            value={element.start}
          >
            {formatMilliseconds(element.start)}
          </TimestampButton>
        </Row>
      </TimestampCol>
      <Col>{element.text}</Col>
    </TranscriptionRow>
  )
}
