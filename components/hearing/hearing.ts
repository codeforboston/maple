import { firestore } from "../firebase"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query
} from "firebase/firestore"
import { DateTime } from "luxon"

export type HearingData = {
  billsInAgenda: any[] | null
  committeeCode: string | null
  committeeName: string | null
  description: string | null
  generalCourtNumber: string | null
  // Date and DateTime cannot be sent through getServerSideProps
  hearingDate: string | null
  hearingId: string
  videoTranscriptionId: string | null
  videoURL: string | null
}

export type Paragraph = {
  confidence: number
  end: number
  start: number
  text: string
}

export const convertToString = (
  value: string | string[] | undefined
): string => {
  if (Array.isArray(value)) {
    return value.join(", ")
  }
  return value ?? ""
}

export async function fetchHearingData(
  hearingId: string
): Promise<HearingData | null> {
  const hearing = await getDoc(doc(firestore, `events/hearing-${hearingId}`))
  if (!hearing.exists()) {
    return null
  }

  const docData = hearing.data()

  const maybeDate = docData.content?.EventDate
  // Event has no provided timezone
  const hearingDate = maybeDate
    ? DateTime.fromISO(maybeDate, { zone: "America/New_York" }).toISO()
    : null

  return {
    billsInAgenda:
      docData.content?.HearingAgendas[0]?.DocumentsInAgenda ?? null,
    committeeCode: docData.content?.HearingHost?.CommitteeCode ?? null,
    committeeName: docData.content?.Name ?? null,
    description: docData.content?.Description ?? null,
    generalCourtNumber:
      docData.content?.HearingHost?.GeneralCourtNumber ?? null,
    hearingDate: hearingDate,
    hearingId: hearingId,
    videoTranscriptionId: docData.videoTranscriptionId ?? null,
    videoURL: docData.videoURL ?? null
  }
}

export async function fetchTranscriptionData(
  videoTranscriptionId: string
): Promise<Paragraph[]> {
  const subscriptionRef = collection(
    firestore,
    `transcriptions/${videoTranscriptionId}/paragraphs`
  )

  let docList: any[] = []

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

export function formatTotalSeconds(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const formattedSeconds = String(totalSeconds)

  return `${formattedSeconds}`
}
