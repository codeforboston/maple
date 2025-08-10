import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query
} from "firebase/firestore"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { Col, Container, Image, Row } from "../bootstrap"
import { firestore } from "components/firebase"

const StyledContainer = styled(Container)`
  font-family: "Nunito";
`

async function HearingData() {
  const hearingId = "hearing-5180"
  const hearing = await getDoc(doc(firestore, `events/${hearingId}`))

  // ignore errors related to: Property X does not exist on type 'DocumentSnapshot<DocumentData>'.

  console.log("data:", hearing.data())

  const docData = hearing.data()
  const content = docData?.content ?? "Default Content"
  const videoTranscriptionId =
    docData?.content ?? "Default Video Transcripton Id"
  const videoURL = docData?.content ?? "Default URL"

  return { content, videoTranscriptionId, videoURL }
}

export const HearingDetails = () => {
  const { t } = useTranslation("common")
  HearingData()

  return (
    <StyledContainer className="mt-3 mb-3">
      <h1>{t("hearing_transcription")}</h1>
      <>Hello Hearing World</>
    </StyledContainer>
  )
}
