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

type DocElement = {
  confidence: number
  end: number
  start: number
  text: string
}

const TranscriptionContainer = styled(Container)`
  background-color: white;
  border-radius: 0.75rem;
`

export const Transcriptions = ({
  videoTranscriptionId
}: {
  videoTranscriptionId: string
}) => {
  console.log("Id: ", videoTranscriptionId)

  let videoTranscriptionURL = videoTranscriptionId || "Default Value"

  const subscriptionRef = collection(
    firestore,
    `transcriptions/${videoTranscriptionURL}/paragraphs`
  )

  const [transData, setTransData] = useState<DocElement[]>([])

  const transcriptionData = useCallback(async () => {
    let docList: DocElement[] = []

    const q = query(subscriptionRef, orderBy("startsAt", "asc"))
    const querySnapshot = await getDocs(q)

    console.log("q: ", querySnapshot)

    querySnapshot.forEach(doc => {
      // doc.data() is never undefined for query doc snapshots
      docList.push(doc.data().text)
    })

    if (docList.length != 0) {
      setTransData(docList)
    }
  }, [subscriptionRef])

  useEffect(() => {
    transcriptionData()
  }, [transcriptionData])

  console.log("T Data: ", transData)

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
