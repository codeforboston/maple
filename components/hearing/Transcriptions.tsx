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
import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { Col, Container, Image, Row } from "../bootstrap"
import { firestore } from "components/firebase"
import * as links from "components/links"

const TranscriptionContainer = styled(Container)`
  background-color: white;
  border-radius: 0.75rem;
`

export const Transcriptions = ({
  videoTranscriptionId
}: {
  videoTranscriptionId: string
}) => {
  if (videoTranscriptionId === "Default Video Transcripton Id") {
    videoTranscriptionId = ""
  }

  console.log("Id: ", videoTranscriptionId)

  const subscriptionRef = collection(
    firestore,
    `transcriptions/${videoTranscriptionId}/paragraghs`
  )

  const transcriptionData = useCallback(async () => {
    const q = query(subscriptionRef, orderBy("startsAt", "asc"))
    const querySnapshot = await getDocs(q)
  }, [subscriptionRef])

  useEffect(() => {
    transcriptionData()
  }, [transcriptionData])

  return (
    <>
      {videoTranscriptionId ? (
        <TranscriptionContainer>
          Hello Transcription World
        </TranscriptionContainer>
      ) : (
        <></>
      )}
    </>
  )
}
