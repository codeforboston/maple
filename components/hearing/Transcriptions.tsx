import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query
} from "firebase/firestore"
import { useRouter } from "next/router"
import { Trans, useTranslation } from "next-i18next"
import React, { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { Col, Container, Image, Row } from "../bootstrap"
import { firestore } from "components/firebase"
import * as links from "components/links"

type DocElement = {
  confidence: number
  end: number
  start: number
  text: string
}

const TimestampButton = styled.button`
  border-radius: 12px;
  width: min-content;
`

const TimestampCol = styled.div`
  width: 100px;
`

const TranscriptionContainer = styled(Container)`
  background-color: white;
  border-radius: 0.75rem;
`

export const Transcriptions = ({
  setCurTimeVideo,
  videoTranscriptionId
}: {
  setCurTimeVideo: any
  videoTranscriptionId: string
}) => {
  const { t } = useTranslation("common")

  console.log("Id: ", videoTranscriptionId)

  let videoTranscriptionURL = videoTranscriptionId || "Default Value"

  const subscriptionRef = collection(
    firestore,
    `transcriptions/${videoTranscriptionURL}/paragraphs`
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

  console.log("T Data: ", transcriptData)

  return (
    <>
      {transcriptData.length > 0 ? (
        <TranscriptionContainer>
          {transcriptData.map((element: DocElement, index: number) => (
            <TranscriptItem
              key={index}
              index={index}
              element={element}
              setCurTimeVideo={setCurTimeVideo}
            />
          ))}
        </TranscriptionContainer>
      ) : (
        <TranscriptionContainer className={`fs-6 fw-bold mb-1`}>
          <div>{t("transcription_not_on_file")}</div>
        </TranscriptionContainer>
      )}
    </>
  )
}

function TranscriptItem({
  element,
  setCurTimeVideo
}: {
  index: number
  element: DocElement
  setCurTimeVideo: any
}) {
  const handleClick = (val: number) => {
    const valSeconds = val / 1000
    // data from backend is in milliseconds
    // needs to be converted to seconds for <video> element
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
    <Row className={`mb-2`}>
      <TimestampCol>
        <Row className={`d-inline`}>
          <TimestampButton
            onClick={() => {
              handleClick(element.start)
            }}
            className={`btn btn-secondary text-nowrap mt-1 mx-1 p-1`}
            type="button"
            value={element.start}
          >
            {formatMilliseconds(element.start)}
          </TimestampButton>
        </Row>
      </TimestampCol>
      <Col>{element.text}</Col>
    </Row>
  )
}
