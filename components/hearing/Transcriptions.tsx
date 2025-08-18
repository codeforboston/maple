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
  const { t } = useTranslation("common")

  console.log("Id: ", videoTranscriptionId)

  let videoTranscriptionURL = videoTranscriptionId || "Default Value"
  // temporarily set to a value that contains `paragraphs` as not all transcriptions do

  // let videoTranscriptionURL = "026df538-3a98-4c70-83e3-41e41d2507fd"

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
            <TranscriptItem key={index} index={index} element={element} />
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

function TranscriptItem({ element }: { index: number; element: DocElement }) {
  return (
    <Row>
      <Col>
        {element.start} - {element.end}
      </Col>
      <Col>{element.text}</Col>
    </Row>
  )
}
