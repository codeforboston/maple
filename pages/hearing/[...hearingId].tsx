import { useEffect, useRef, useState } from "react"
import Head from "next/head"
import styles from "../../styles/VideoTranscription.module.css" // Adjust the path as necessary
import { firestore } from "../../components/firebase"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  where,
  orderBy,
  query as fbQuery
} from "firebase/firestore"
import { z } from "zod"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

const Query = z.object({ hearingId: z.string({}) })

export default function VideoTranscription({
  videoUrl,
  utterances
}: {
  videoUrl: any
  utterances: Array<any>
}) {
  const [currentTime, setCurrentTime] = useState(0)
  const videoRef = useRef<any>(null)
  const transcriptionRef = useRef<any>(null)
  const utteranceRefs = useRef<any>({})

  // Update current time when video plays
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime * 1000) // Convert to ms
    }
  }

  // Scroll to the current utterance
  useEffect(() => {
    const currentUtterance = utterances.find(
      utterance =>
        currentTime >= utterance.start && currentTime <= utterance.end
    )

    if (currentUtterance && utteranceRefs.current[currentUtterance.start]) {
      const element = utteranceRefs.current[currentUtterance.start]
      const container = transcriptionRef.current

      if (container) {
        container.scrollTop = element.offsetTop - container.offsetTop - 100 // Offset for better visibility
      }
    }
  }, [currentTime, utterances])

  // Click on transcription to seek video
  const seekToTime = (startTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime / 1000 // Convert ms to seconds
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Video Transcription</title>
        <meta
          name="description"
          content="Video with synchronized transcription"
        />
      </Head>

      <main className={styles.main}>
        <div className={styles.videoContainer}>
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            onTimeUpdate={handleTimeUpdate}
            className={styles.video}
          />
        </div>

        <div className={styles.transcriptionContainer} ref={transcriptionRef}>
          <h2>Transcription</h2>
          <div className={styles.transcription}>
            {utterances.map(utterance => {
              const isActive =
                currentTime >= utterance.start && currentTime <= utterance.end
              return (
                <div
                  key={utterance.start}
                  ref={el => (utteranceRefs.current[utterance.start] = el)}
                  className={`${styles.utterance} ${
                    isActive ? styles.active : ""
                  }`}
                  onClick={() => seekToTime(utterance.start)}
                >
                  <span className={styles.timestamp}>
                    {formatTime(utterance.start)} - {formatTime(utterance.end)}
                  </span>
                  <p>{utterance.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}

// Helper function to format milliseconds to MM:SS format
function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`
}

export const getServerSideProps: GetServerSideProps = async ctx => {
  const locale = ctx.locale ?? ctx.defaultLocale ?? "en"
  const query = Query.safeParse(ctx.query)
  if (!query.success) return { notFound: true }
  const { hearingId } = query.data

  const rawHearing = await getDoc(doc(firestore, `events/hearing-${hearingId}`))
  if (!rawHearing.exists) return { notFound: true }

  const hearing = rawHearing.data() as any
  const transcriptionId = hearing.videoAssemblyId
  if (!transcriptionId) return { notFound: true }

  const rawTranscription = await getDoc(
    doc(firestore, `transcriptions/${transcriptionId}`)
  )
  if (!rawTranscription.exists()) return { notFound: true }
  const transcription = rawTranscription.data() as any

  const videoUrl = transcription.data().audio_url

  const docRef = collection(
    firestore,
    `transcriptions/${transcriptionId}/utterances`
  )
  const q = fbQuery(docRef, orderBy("start", "asc"))

  const rawUtterances = await getDocs(q)
  if (rawUtterances.empty) {
    console.log("No utterances found")
    return { notFound: true }
  }

  const utterances = rawUtterances.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  }))

  return {
    props: {
      videoUrl,
      utterances,
      ...(await serverSideTranslations(locale, [
        "auth",
        "common",
        "footer",
        "testimony",
        "profile"
      ]))
    }
  }
}
