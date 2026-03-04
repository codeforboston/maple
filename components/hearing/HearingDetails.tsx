import { useRouter } from "next/router"
import { Trans, useTranslation } from "next-i18next"
import { useEffect, useRef, useState } from "react"
import styled from "styled-components"
import { ButtonGroup } from "react-bootstrap"
import { Col, Container, Image, Row, Button } from "../bootstrap"
import * as links from "../links"
import { committeeURL, External } from "../links"
import {
  Back,
  ButtonContainer,
  FeatureCalloutButton
} from "../shared/CommonComponents"
import { HearingSidebar } from "./HearingSidebar"
import {
  HearingData,
  Paragraph,
  TranscriptData,
  convertToString,
  fetchTranscriptionData,
  toVTT
} from "./hearing"
import { Transcriptions } from "./Transcriptions"

const LegalContainer = styled(Container)`
  background-color: white;
`

const VideoChild = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
`

const VideoParent = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* For 16:9 aspect ratio */
  overflow: hidden;
`

const VideoButton = styled(Button)`
  border: none;
  background: transparent;
  color: ${({ $active }) => ($active ? "#212529" : "#6c757d")};
  font-weight: ${({ $active }) => ($active ? "600" : "500")};
  padding: 0.75rem 1rem;
  border-radius: 0;
  position: relative;
  transition: all 0.25s ease-in-out;

  &:hover {
    color: #212529;
    background-color: rgba(0, 0, 0, 0.03);
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    width: ${({ $active }) => ($active ? "100%" : "0%")};
    height: 2px;
    background-color: #212529;
    transition: all 0.3s ease-in-out;
    transform: translateX(-50%);
  }
`

export const HearingDetails = ({
  hearingData: {
    billsInAgenda,
    committeeCode,
    committeeName,
    description,
    generalCourtNumber,
    hearingDate,
    hearingId,
    videos
  }
}: {
  hearingData: HearingData
}) => {
  const { t } = useTranslation(["common", "hearing"])
  const router = useRouter()
  const previousActive = useRef<number | null>(null)
  const routerReady = useRef(false)
  const [activeVideo, setActiveVideo] = useState<number>(0)
  const [transcripts, setTranscripts] = useState<
    (TranscriptData | null)[] | null
  >(null)

  // Important this occurs before router check; otherwise time will be improperly removed on first render
  useEffect(() => {
    if (
      previousActive.current === null ||
      previousActive.current === activeVideo
    )
      return
    previousActive.current = activeVideo
    if (activeVideo !== 0) {
      router.replace(
        {
          pathname: router.pathname,
          query: {
            hearingId: hearingId,
            v: activeVideo + 1
          }
        },
        undefined,
        { shallow: true }
      )
    } else {
      router.replace(
        {
          pathname: router.pathname,
          query: {
            hearingId: hearingId
          }
        },
        undefined,
        { shallow: true }
      )
    }
  }, [activeVideo])

  // Runs once
  useEffect(() => {
    if (!router.isReady || routerReady.current) return
    routerReady.current = true

    const query = router.query.v
    if (typeof query !== "string") {
      previousActive.current = activeVideo
      return
    }
    const n = parseInt(query, 10)
    if (!isNaN(n) && n >= 1 && n <= videos.length) {
      setActiveVideo(n - 1)
      previousActive.current = n - 1
    }
  }, [router.isReady])

  useEffect(() => {
    ;(async function () {
      const transcripts = await Promise.all(
        videos.map(v =>
          v.transcriptionId ? fetchTranscriptionData(v.transcriptionId) : null
        )
      )
      const result = transcripts.map((t, index) => {
        if (!t) return null
        const filename =
          transcripts.length == 1
            ? `hearing-${hearingId}`
            : `hearing-${hearingId}-${index + 1}`
        const vtt = toVTT(t)
        const blob = new Blob([vtt], { type: "text/vtt" })

        return {
          title: videos[index].title,
          transcript: t,
          blob: blob,
          filename: filename
        }
      })
      setTranscripts(result)
    })()
  }, [videos])

  const videoRef = useRef<HTMLVideoElement>(null)
  function setCurTimeVideo(value: number) {
    videoRef.current ? (videoRef.current.currentTime = value) : null
  }

  useEffect(() => {
    const startTime = router.query.t
    const resultString: string = convertToString(startTime)

    if (startTime && videoRef.current) {
      setCurTimeVideo(parseInt(resultString, 10))
    }
  }, [router.query.t, videoRef.current])

  return (
    <Container className="mt-3 mb-3">
      <Row className={`mb-3`}>
        <Col>
          <Back href="/hearings">{t("back_to_hearings")}</Back>
        </Col>
      </Row>

      {videos.length ? (
        <ButtonContainer className={`mb-2`}>
          {/* ButtonContainer contrains clickable area of link so that it doesn't exceed
              the button and strech invisibly across the width of the page */}
          <FeatureCalloutButton
            className={`btn btn-secondary d-flex text-nowrap mt-1 mx-1 p-1`}
          >
            &nbsp;{" "}
            {t("video_and_transcription_feature_callout", { ns: "hearing" })}{" "}
            &nbsp;
          </FeatureCalloutButton>
        </ButtonContainer>
      ) : (
        <></>
      )}

      {committeeName ? (
        committeeCode ? (
          <h1>
            <External href={committeeURL(committeeCode)}>
              {committeeName}
            </External>
          </h1>
        ) : (
          <h1>{committeeName}</h1>
        )
      ) : (
        <></>
      )}

      <h5 className={`mb-3`}>{description}</h5>

      <Row>
        <Col className={`col-md-8 mt-4`}>
          {transcripts !== null && transcripts.length > 0 ? (
            <LegalContainer className={`pb-2 rounded`}>
              <Row
                className={`d-flex align-items-center justify-content-between`}
                fontSize={"12px"}
                xs="auto"
              >
                <Col>
                  <div className={`fs-6 fw-bold mt-2`}>
                    <Image
                      src="/images/smart-summary.svg"
                      alt={t("bill.smart_tag")}
                      height={`34`}
                      width={`24`}
                      className={`me-2 pb-1`}
                    />
                    {t("bill.smart_disclaimer2")}
                  </div>
                </Col>

                <Col>
                  <Trans
                    t={t}
                    i18nKey="bill.smart_disclaimer3"
                    components={[
                      // eslint-disable-next-line react/jsx-key
                      <links.Internal href="/about/how-maple-uses-ai" />
                    ]}
                  />
                </Col>
              </Row>
            </LegalContainer>
          ) : (
            <></>
          )}

          {videos.length > 1 ? (
            <ButtonGroup aria-label="Video buttons" className={`mt-3`}>
              {videos.map((video, index) => (
                <VideoButton
                  key={index}
                  variant="link"
                  $active={activeVideo === index}
                  onClick={() => setActiveVideo(index)}
                >
                  {video.title}
                </VideoButton>
              ))}
            </ButtonGroup>
          ) : (
            <div className={`mt-3`}></div>
          )}

          {videos.length > 0 ? (
            <>
              <VideoParent>
                <VideoChild
                  ref={videoRef}
                  src={videos[activeVideo].url}
                  controls
                  muted
                />
              </VideoParent>
            </>
          ) : (
            <LegalContainer className={`fs-6 fw-bold my-3 py-2 rounded`}>
              {t("no_video_or_transcript", { ns: "hearing" })}
            </LegalContainer>
          )}

          {transcripts && transcripts.length > 0 ? (
            <Transcriptions
              activeVideo={activeVideo}
              hearingId={hearingId}
              transcripts={transcripts}
              setCurTimeVideo={setCurTimeVideo}
              videoRef={videoRef}
            />
          ) : videos.length > 0 ? (
            <LegalContainer className={`fs-6 fw-bold mb-2 py-2 rounded-bottom`}>
              <div>{t("transcript_loading", { ns: "hearing" })}</div>
            </LegalContainer>
          ) : null}
        </Col>

        <div className={`col-md-4`}>
          <HearingSidebar
            activeVideo={activeVideo}
            billsInAgenda={billsInAgenda}
            committeeCode={committeeCode}
            generalCourtNumber={generalCourtNumber}
            hearingDate={hearingDate}
            transcripts={transcripts}
          />
        </div>
      </Row>
    </Container>
  )
}
