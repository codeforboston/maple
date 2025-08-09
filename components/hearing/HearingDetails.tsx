import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query
} from "firebase/firestore"
import { useTranslation } from "next-i18next"
import { firestore } from "components/firebase"

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
  HearingData()

  return <>Hello Hearing World</>
}
