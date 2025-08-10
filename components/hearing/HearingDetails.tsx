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

  console.log("hearing", hearing._document.data.value.mapValue.fields)

  const { videoTranscriptionId, videoURL } = hearing.data()

  console.log("url", videoURL)

  return hearing
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
