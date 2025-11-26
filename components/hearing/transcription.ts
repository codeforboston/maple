import { firestore } from "../firebase"
import { collection, getDocs, orderBy, query } from "firebase/firestore"

export type Paragraph = {
  confidence: number
  end: number
  start: number
  text: string
}

export async function fetchTranscriptionData(videoTranscriptionId: string): Paragraph[] {
  const subscriptionRef = collection(
    firestore,
    `transcriptions/${videoTranscriptionId}/paragraphs`
  )

  let docList: Paragraph[] = []

  const q = query(subscriptionRef, orderBy("start"))
  const querySnapshot = await getDocs(q)

  querySnapshot.forEach(doc => {
    // doc.data() is never undefined for query doc snapshots
    docList.push(doc.data())
  })

  return docList
}

export function formatMilliseconds(ms: number): string {
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


