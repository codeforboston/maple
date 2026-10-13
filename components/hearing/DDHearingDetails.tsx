import { faMagnifyingGlass, faTimes } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTranslation } from "next-i18next"
import { useEffect, useMemo, useRef, useState } from "react"
import styled from "styled-components"
import { Badge, Carousel, Col, Container, Row } from "../bootstrap"
import { Back } from "../shared/CommonComponents"
import { Internal } from "../links"
import { formatMilliseconds } from "./hearing"
import { HearingSidebar } from "./HearingSidebar"
import { DDHearing, DDUtterance, speakerName } from "./digitalDemocracyApi"

// Hardcoded for hearing 279802 for testing; production needs a real hid -> committee/general court lookup
const COMMITTEE_CODE = "SJ42"
const GENERAL_COURT_NUMBER = "194"

const ddApiPersonIdToMemberId: Record<number, string> = {
  211022: "PRF0", // Paul Feeney
  211000: "MSD1", // Michael Day
  211028: "RCF0", // Ryan Fattman
  210993: "K_H1", // Kate Hogan
  210961: "DTV1", // David Vieira
  210945: "CFF0", // Cindy Friedman
  210928: "BRF0", // Barry Finegold
  210931: "BPC0", // Brendan Crighton
  210924: "AHP1", // Alice Peisch
  210964: "FAM1" // Frank Moran
}

const PARTY_ABBREVIATION: Record<string, string> = {
  Democrat: "D",
  Republican: "R"
}

const VideoWrapper = styled.div`
  max-width: 700px;
  margin: 0 auto;
`

/* padding-top % is relative to VideoWrapper's width, so max-width must live there, not here */
const VideoParent = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* For 16:9 aspect ratio */
  overflow: hidden;
`

const VideoChild = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
`

const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
  background-color: var(--maple-surface-hearing-search);
  padding: 1rem;
  margin-top: 1rem;
  border-radius: 0.5rem;
`

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: none;
  background-color: var(--maple-surface-base);
  font-size: 1rem;
  outline: none;
  color: var(--maple-brand-primary);

  &::placeholder {
    color: var(--maple-text-muted);
  }
`

const SearchIcon = styled(FontAwesomeIcon)`
  position: absolute;
  right: 1.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--maple-brand-primary);
  font-size: 1rem;
`

const ClearButton = styled(FontAwesomeIcon)`
  position: absolute;
  right: 3.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--maple-brand-primary);
  font-size: 1rem;
  cursor: pointer;
`

const TranscriptContainer = styled(Container)`
  background-color: var(--maple-surface-base);
  max-height: 500px;
  overflow-y: auto;
`

const TranscriptRow = styled(Row)`
  cursor: pointer;

  &:nth-child(even) {
    background-color: white;
  }
  &:nth-child(odd) {
    background-color: var(--maple-surface-transcript-stripe);
  }
  &:hover {
    background-color: var(--maple-surface-transcript-hover);
  }
`

const Speaker = styled.div`
  font-weight: 600;
  color: var(--maple-text-strong);
  min-width: 160px;
  max-width: 160px;
`

function csvField(value: string): string {
  if (/["\n,]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

function utterancesToCsv(utterances: DDUtterance[]): string {
  const header = ["Speaker", "Party", "Type", "Timestamp", "Text"]
  const rows = utterances.map(utterance => {
    const name = speakerName(utterance) ?? "Unknown speaker"
    return [
      name,
      utterance.party ?? "",
      utterance.person_type,
      formatMilliseconds(utterance.timestamp * 1000),
      utterance.content
    ]
      .map(csvField)
      .join(",")
  })
  return [header.join(","), ...rows].join("\n")
}

export const DDHearingDetails = ({ hearing }: { hearing: DDHearing }) => {
  const { t } = useTranslation(["common", "hearing"])
  const [utterances, setUtterances] = useState<DDUtterance[] | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const videoRefs = useRef(new Map<number, HTMLVideoElement>())

  useEffect(() => {
    let cancelled = false
    ;(async function () {
      const res = await fetch(`/api/hearings/${hearing.hid}/utterances`)
      if (!res.ok || cancelled) return
      const body: { utterances: DDUtterance[] } = await res.json()
      if (!cancelled) setUtterances(body.utterances)
    })()
    return () => {
      cancelled = true
    }
  }, [hearing.hid])

  // Build a downloadable CSV of the full transcript entirely in the browser.
  useEffect(() => {
    if (!utterances || utterances.length === 0) {
      setDownloadUrl(null)
      return
    }
    const blob = new Blob([utterancesToCsv(utterances)], {
      type: "text/csv;charset=utf-8;"
    })
    const url = URL.createObjectURL(blob)
    setDownloadUrl(url)
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [utterances])

  const videos = useMemo(
    () =>
      [...hearing.hearing_videos].sort(
        (a, b) => (a.start_time ?? a.uid) - (b.start_time ?? b.uid)
      ),
    [hearing.hearing_videos]
  )

  const filteredUtterances = useMemo(() => {
    if (!utterances) return []
    if (!searchTerm) return utterances
    return utterances.filter(utterance =>
      utterance.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [utterances, searchTerm])

  // `file_id` ties an utterance to a specific video; `timestamp` is an offset
  // in seconds from the start of that video.
  const handleSeek = (utterance: DDUtterance) => {
    const index = videos.findIndex(video => video.file_id === utterance.file_id)
    if (index === -1) return
    const video = videoRefs.current.get(index)
    if (!video) return
    video.currentTime = utterance.timestamp
    if (index !== activeIndex) setActiveIndex(index)
  }

  return (
    <Container className="mt-3 mb-3">
      <Row className="mb-3">
        <Col>
          <Back href="/hearings">{t("back_to_hearings")}</Back>
        </Col>
      </Row>

      <h1>{hearing.title}</h1>

      <Row>
        <Col className="col-md-8 mt-4">
          {videos.length > 0 ? (
            <Carousel
              className="mt-3"
              interval={null}
              indicators={videos.length > 1}
              controls={videos.length > 1}
              activeIndex={activeIndex}
              onSelect={index => setActiveIndex(index)}
            >
              {videos.map((video, index) => (
                <Carousel.Item key={video.uid}>
                  <VideoWrapper>
                    <VideoParent>
                      <VideoChild
                        ref={elem => {
                          if (elem) videoRefs.current.set(index, elem)
                          else videoRefs.current.delete(index)
                        }}
                        src={video.video_url}
                        controls
                        muted
                      />
                    </VideoParent>
                  </VideoWrapper>
                </Carousel.Item>
              ))}
            </Carousel>
          ) : null}

          <SearchWrapper>
            <SearchInput
              type="text"
              placeholder={t("search_placeholder", { ns: "hearing" })}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <ClearButton icon={faTimes} onClick={() => setSearchTerm("")} />
            )}
            <SearchIcon icon={faMagnifyingGlass} />
          </SearchWrapper>

          <TranscriptContainer className="mt-3 rounded">
            {utterances === null ? (
              <div className="py-2 px-2">
                {t("transcript_loading", { ns: "hearing" })}
              </div>
            ) : filteredUtterances.length === 0 && searchTerm ? (
              <div className="py-2 px-2">
                {t("no_results_found", { ns: "hearing", searchTerm })}
              </div>
            ) : (
              filteredUtterances.map(utterance => {
                const name =
                  speakerName(utterance) ??
                  t("unknown_speaker", { ns: "hearing" })
                const memberId =
                  utterance.person_type === "legislator" &&
                  utterance.pid !== null
                    ? ddApiPersonIdToMemberId[utterance.pid]
                    : undefined
                const partyAbbreviation = utterance.party
                  ? PARTY_ABBREVIATION[utterance.party]
                  : undefined

                return (
                  <TranscriptRow
                    className="py-2 px-2"
                    key={utterance.uid}
                    onClick={() => handleSeek(utterance)}
                  >
                    <Col className="d-flex">
                      <Speaker>
                        {memberId ? (
                          <Internal href={`/legislators/194/${memberId}`}>
                            {name}
                          </Internal>
                        ) : (
                          name
                        )}
                        {partyAbbreviation && ` (${partyAbbreviation})`}
                        {utterance.person_type === "legislator" && (
                          <div>
                            <Badge bg="secondary">
                              {t("legislator_tag", { ns: "hearing" })}
                            </Badge>
                          </div>
                        )}
                      </Speaker>
                      <div>{utterance.content}</div>
                    </Col>
                  </TranscriptRow>
                )
              })
            )}
          </TranscriptContainer>
        </Col>

        <div className="col-md-4">
          <HearingSidebar
            activeVideo={0}
            billsInAgenda={null}
            committeeCode={COMMITTEE_CODE}
            externalDownloadFilename="transcript.csv"
            externalDownloadUrl={downloadUrl ?? undefined}
            generalCourtNumber={GENERAL_COURT_NUMBER}
            hearingDate={hearing.date}
            transcripts={null}
          />
        </div>
      </Row>
    </Container>
  )
}
