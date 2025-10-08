import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { useTranslation } from "next-i18next"
import React, { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { Col, Container, Row } from "../bootstrap"
import { firestore } from "components/firebase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass, faTimes } from "@fortawesome/free-solid-svg-icons"

type Paragraph = {
  confidence: number
  end: number
  start: number
  text: string
}
const ClearButton = styled(FontAwesomeIcon)`
  position: absolute;
  right: 3rem;
  top: 50%;
  transform: translateY(-50%);
  color: #1a3185;
  font-size: 1rem;
  z-index: 1;
  cursor: pointer;
`
const ErrorContainer = styled(Container)`
  background-color: white;
`

const TimestampButton = styled.button`
  font-size: 14px;
  width: min-content;
`

const TimestampCol = styled.div`
  text-align: center;
  width: 140px;
`

const NoResultFound = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 88px;
`

const TranscriptBottom = styled(Row)`
  background-color: white;
  border-bottom-left-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
  height: 9px;
`

const TranscriptContainer = styled(Container)`
  max-height: 18rem;
  overflow-y: auto;
  background-color: #ffffff;
`

const TranscriptHeader = styled(Row)`
  background-color: white;
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
  padding-top: 9px;
`

// consider removing TranscriptionHeader when Search is implemented to
// make containers: Search followed by Transcriptions flush per figma

const TranscriptRow = styled(Row)`
  &:nth-child(even) {
    background-color: white;
    border-left-color: white;
    border-left-style: solid;
    border-left-width: 5px;
  }
  &:nth-child(odd) {
    background-color: #e8ecf4;
    border-left-color: #e8ecf4;
    border-left-style: solid;
    border-left-width: 5px;
  }
  &:last-child {
    border-bottom-left-radius: 0.75rem;
    border-bottom-right-radius: 0.75rem;
  }
`
const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: none;
  background-color: #ffffff;
  font-size: 1rem;
  outline: none;
  color: #1a3185;
  &:focus {
    border-color: #999;
    background-color: #fff;
  }

  &::placeholder {
    color: #aaa;
  }
`

const SearchIcon = styled(FontAwesomeIcon)`
  position: absolute;
  right: 1.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #1a3185;
  font-size: 1rem;
  z-index: 1;
`

const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
  background-color: #8c98c2;
  padding: 1.5rem 1rem;
`

export const Transcriptions = ({
  setCurTimeVideo,
  videoLoaded,
  videoRef,
  videoTranscriptionId
}: {
  setCurTimeVideo: any
  videoLoaded: boolean
  videoRef: any
  videoTranscriptionId: string
}) => {
  const { t } = useTranslation(["common", "hearing"])
  const [highlightedId, setHighlightedId] = useState(-1)
  const [transcriptData, setTranscriptData] = useState<Paragraph[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const vid = videoTranscriptionId || "prevent FirebaseError"

  const subscriptionRef = collection(
    firestore,
    `transcriptions/${vid}/paragraphs`
  )

  const fetchTranscriptionData = useCallback(async () => {
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

  const handleClearInput = () => {
    setSearchTerm("")
  }

  useEffect(() => {
    fetchTranscriptionData()
  }, [fetchTranscriptionData])

  const filteredData = transcriptData.filter(el =>
    el.text.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    const handleTimeUpdate = () => {
      const currentIndex = transcriptData.findIndex(
        element => videoRef.current.currentTime <= element.end / 1000
      )
      setHighlightedId(currentIndex)
    }

    const videoElement = videoRef.current
    videoLoaded
      ? videoElement.addEventListener("timeupdate", handleTimeUpdate)
      : null

    return () => {
      videoLoaded
        ? videoElement.removeEventListener("timeupdate", handleTimeUpdate)
        : null
    }
  }, [transcriptData, videoLoaded, videoRef])

  return (
    <>
      <SearchWrapper>
        <SearchInput
          type="text"
          placeholder={t("search_placeholder", {
            ns: "hearing",
            defaultValue: "Search..."
          })}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <ClearButton icon={faTimes} onClick={handleClearInput} />
        )}
        <SearchIcon icon={faMagnifyingGlass} />
      </SearchWrapper>
      {transcriptData.length > 0 ? (
        <TranscriptContainer className={`mb-2`}>
          <TranscriptHeader />
          {filteredData.map((element: Paragraph, index: number) => (
            <TranscriptItem
              key={index}
              element={element}
              highlightedId={highlightedId}
              index={index}
              setCurTimeVideo={setCurTimeVideo}
              searchTerm={searchTerm}
            />
          ))}
          {filteredData.length === 0 && (
            <NoResultFound>
              {t("no_results_found", {
                ns: "hearing",
                searchTerm,
                defaultValue: "No result found..."
              })}
            </NoResultFound>
          )}
          <TranscriptBottom />
        </TranscriptContainer>
      ) : (
        <ErrorContainer className={`fs-6 fw-bold mb-2 py-2 rounded`}>
          <div>{t("transcription_not_on_file", { ns: "hearing" })}</div>
        </ErrorContainer>
      )}
    </>
  )
}

function TranscriptItem({
  element,
  highlightedId,
  index,
  setCurTimeVideo,
  searchTerm
}: {
  element: Paragraph
  highlightedId: number
  index: number
  setCurTimeVideo: any
  searchTerm: string
}) {
  const handleClick = (val: number) => {
    const valSeconds = val / 1000
    /* data from backend is in milliseconds
     
       needs to be converted to seconds to 
       set currentTime property of <video> element */

    setCurTimeVideo(valSeconds)
  }

  const formatMilliseconds = (ms: number) => {
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

  const isHighlighted = (index: number): boolean => {
    return index === highlightedId
  }
  const highlightText = (text: string, term: string) => {
    if (!term) return text
    const regex = new RegExp(`(${term})`, "gi")
    return text
      .split(regex)
      .map((part, i) => (regex.test(part) ? <mark key={i}>{part}</mark> : part))
  }
  return (
    <TranscriptRow
      className={
        isHighlighted(index)
          ? `bg-info border-5 border-secondary border-start`
          : `border-5`
      }
    >
      <TimestampCol>
        <Row className={`d-inline`}>
          <TimestampButton
            onClick={() => {
              handleClick(element.start)
            }}
            className={`bg-transparent border-0 text-nowrap p-1`}
            type="button"
            value={element.start}
          >
            {formatMilliseconds(element.start)}
            {" - "}
            {formatMilliseconds(element.end)}
          </TimestampButton>
        </Row>
      </TimestampCol>
      <Col className={`pt-1`}>{highlightText(element.text, searchTerm)}</Col>
    </TranscriptRow>
  )
}
