import { faMagnifyingGlass, faTimes } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTranslation } from "next-i18next"
import React, { forwardRef, useEffect, useRef, useState } from "react"
import styled from "styled-components"
import { Col, Container, Row } from "../bootstrap"
import { Paragraph, formatMilliseconds } from "./hearing"

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

const ResultNumText = styled.div`
  position: absolute;
  right: 4rem;
  top: 50%;
  user-select: none;
  transform: translateY(-50%);
  color: #979797;
`

const ErrorContainer = styled(Container)`
  background-color: white;
`

const NoResultFound = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 88px;
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

const TimestampButton = styled.button`
  font-size: 14px;
  width: min-content;
  &:hover {
    font-weight: bold;
    text-decoration: underline;
  }
`

const TimestampCol = styled.div`
  text-align: center;
  width: 140px;
`

const TranscriptBottom = styled(Container)`
  background-color: white;
  border-bottom-left-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
  height: 9px;
`

const TranscriptContainer = styled(Container)`
  max-height: 483px;
  overflow-y: auto;
  background-color: #ffffff;
`

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

export const Transcriptions = ({
  transcriptData,
  setCurTimeVideo,
  videoLoaded,
  videoRef
}: {
  transcriptData: Paragraph[]
  setCurTimeVideo: any
  videoLoaded: boolean
  videoRef: any
}) => {
  const { t } = useTranslation(["common", "hearing"])
  const containerRef = useRef<any | null>(null)
  const [highlightedId, setHighlightedId] = useState(-1)
  const transcriptRefs = useRef(new Map())
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredData, setFilteredData] = useState<Paragraph[]>([])

  const handleClearInput = () => {
    setSearchTerm("")
  }

  useEffect(() => {
    setFilteredData(
      transcriptData.filter(el =>
        el.text.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [transcriptData, searchTerm])

  useEffect(() => {
    const handleTimeUpdate = () => {
      const currentIndex = transcriptData.findIndex(
        element => videoRef.current.currentTime <= element.end / 1000
      )
      if (containerRef.current && currentIndex !== highlightedId) {
        setHighlightedId(currentIndex)
        if (currentIndex !== -1 && !searchTerm) {
          const container = containerRef.current
          const elem = transcriptRefs.current.get(currentIndex)
          const elemTop = elem.offsetTop - container.offsetTop
          const elemBottom = elemTop + elem.offsetHeight
          const viewTop = container.scrollTop
          const viewBottom = viewTop + container.clientHeight

          if (elemTop < viewTop) {
            container.scrollTo({
              top: elemTop,
              behavior: "smooth"
            })
          } else if (elemBottom > viewBottom) {
            container.scrollTo({
              top: elemBottom - container.clientHeight,
              behavior: "smooth"
            })
          }
        }
      }
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
  }, [highlightedId, transcriptData, videoLoaded, videoRef, searchTerm])

  return
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
          <>
            <ResultNumText>
              {t("num_results", {
                ns: "hearing",
                count: filteredData.length
              })}
            </ResultNumText>
            <ClearButton icon={faTimes} onClick={handleClearInput} />
          </>
        )}
        <SearchIcon icon={faMagnifyingGlass} />
      </SearchWrapper>
      <TranscriptContainer ref={containerRef}>
        {filteredData.map((element: Paragraph, index: number) => (
          <TranscriptItem
            key={index}
            element={element}
            highlightedId={highlightedId}
            index={index}
            ref={elem => {
              if (elem) {
                transcriptRefs.current.set(index, elem)
              } else {
                transcriptRefs.current.delete(index)
              }
            }}
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
      </TranscriptContainer>
      <TranscriptBottom />
    </>
}

// forwardRef must be updated for React 19 migration
const TranscriptItem = forwardRef(function TranscriptItem(
  {
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
  },
  ref: any
) {
  const handleClick = (val: number) => {
    const valSeconds = val / 1000
    /* data from backend is in milliseconds
     
       needs to be converted to seconds to 
       set currentTime property of <video> element */

    setCurTimeVideo(valSeconds)
  }

  const isHighlighted = (index: number): boolean => {
    return index === highlightedId
  }
  const highlightText = (text: string, term: string) => {
    if (!term) return text
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const regex = new RegExp(`(${escaped})`, "gi")
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className={`p-0`}>
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <TranscriptRow
      className={
        isHighlighted(index)
          ? `bg-info border-5 border-secondary border-start`
          : `border-5`
      }
      ref={ref}
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
})
