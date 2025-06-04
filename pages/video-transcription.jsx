import { useEffect, useRef, useState } from "react"
import Head from "next/head"
import styles from "../styles/VideoTranscription.module.css"
import { firestore } from "../components/firebase"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query
} from "firebase/firestore"
import { useQuery } from "react-query"
import { useRouter } from "next/router"

export default function VideoTranscription({ videoUrl, utterances }) {
  const [currentTime, setCurrentTime] = useState(0)
  const videoRef = useRef(null)
  const transcriptionRef = useRef(null)
  const utteranceRefs = useRef({})

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
  const seekToTime = startTime => {
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
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`
}

export async function getServerSideProps() {
  const hearingId = "hearing-5180"
  const hearing = await getDoc(doc(firestore, `events/${hearingId}`))
  const { videoTranscriptionId, videoURL } = hearing.data()

  // should be
  // const exampleTranscriptionId = "639e73ff-bd01-4902-bba7-88faaf39afa9"
  const transcription = await getDoc(
    doc(firestore, `transcriptions/${videoTranscriptionId}`)
  )
  const utterances = await getDocs(
    query(
      collection(
        firestore,
        `transcriptions/${videoTranscriptionId}/utterances`
      ),
      orderBy("start", "asc")
    )
  )

  return {
    props: {
      videoUrl: videoURL,
      utterances: utterances.docs.map(doc => doc.data())
    }
  }
}
