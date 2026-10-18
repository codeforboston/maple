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
  toTitleCase,
  fetchTranscriptionData,
  toVTT
} from "./hearing"
import { Transcriptions } from "./Transcriptions"

/* The feature tag above the title shows under the Maple skin only. The
   Digital Democracy and Mixed skins leave it out: the AI banner over the video
   already says the same thing. */
const ClassicFeatureTag = styled.div`
  [data-maple-theme="dd"] & {
    display: none;
  }
`

/* The page header comes in two arrangements, one per skin; only one shows.

   Maple: the committee name as the title, the description under it. */
const ClassicHeader = styled.div`
  [data-maple-theme="dd"] & {
    display: none;
  }
`

/* Digital Democracy and Mixed: the title is the description, in title case,
   with the committee as a smaller linked line below it. Without a description
   the committee is the title, and without either it is "Hearing on" the date,
   which otherwise lives in the sidebar as the recording date. */
const TopicHeader = styled.header`
  display: none;
  margin-bottom: 1rem;

  [data-maple-theme="dd"] & {
    display: block;
  }

  h1 {
    margin-bottom: 0.25rem;
  }

  /* Supporting text, so Nunito even when the typeface switch puts headings in
     Lexend, in the body text colour like a subtitle. The committee link takes
     that colour too and drops its underline, showing it only on hover. */
  .committee {
    font-family: "Nunito", system-ui, -apple-system, "Segoe UI", sans-serif;
    font-size: 1.125rem;
    color: var(--maple-text-body);
    margin-bottom: 0;
  }

  .committee a {
    color: inherit;
    text-decoration: none;
  }

  .committee a:hover,
  .committee a:focus-visible {
    text-decoration: underline;
  }
`

const LegalContainer = styled(Container)`
  background-color: white;
  border: 1px solid var(--maple-card-edge);
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
  color: ${({ $active }) =>
    $active ? "var(--maple-text-strong)" : "var(--maple-text-muted)"};
  font-weight: ${({ $active }) => ($active ? "600" : "500")};
  padding: 0.75rem 1rem;
  border-radius: 0;
  position: relative;
  transition: all 0.25s ease-in-out;

  &:hover {
    color: var(--maple-text-strong);
    background-color: var(--maple-surface-muted);
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    width: ${({ $active }) => ($active ? "100%" : "0%")};
    height: 2px;
    background-color: var(--maple-text-strong);
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

  // For the title: a description or committee name that is only whitespace
  // counts as missing, so the title falls back instead of showing blank.
  const topic = description?.trim() || null
  const committee = committeeName?.trim() || null

  // Formatted the way HearingSidebar shows the recording date. Only used for
  // the title when a hearing has neither a description nor a committee.
  const parsedDate = hearingDate ? new Date(hearingDate) : null
  const formattedDate =
    parsedDate && !isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleDateString("en-US", {
          month: "long",
          day: "2-digit",
          year: "numeric"
        })
      : null
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
        <>
          <ClassicFeatureTag>
            <ButtonContainer className={`mb-2`}>
              {/* ButtonContainer contrains clickable area of link so that it doesn't exceed
              the button and strech invisibly across the width of the page */}
              <FeatureCalloutButton
                className={`btn btn-secondary d-flex text-nowrap mt-1 mx-1 p-1`}
              >
                &nbsp;{" "}
                {t("video_and_transcription_feature_callout", {
                  ns: "hearing"
                })}{" "}
                &nbsp;
              </FeatureCalloutButton>
            </ButtonContainer>
          </ClassicFeatureTag>
        </>
      ) : (
        <></>
      )}

      <ClassicHeader>
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
      </ClassicHeader>

      <TopicHeader>
        {/* The title is the description; failing that, the committee; failing
            that, the date. */}
        {topic ? (
          <h1>{toTitleCase(topic)}</h1>
        ) : committee ? (
          <h1>
            {committeeCode ? (
              <External href={committeeURL(committeeCode)}>
                {committee}
              </External>
            ) : (
              committee
            )}
          </h1>
        ) : formattedDate ? (
          <h1>{t("title_on_date", { ns: "hearing", date: formattedDate })}</h1>
        ) : (
          <></>
        )}
        {/* The committee line only shows under a description title; otherwise
            the committee is already in the title. */}
        {topic && committee ? (
          <p className="committee">
            {committeeCode ? (
              <External href={committeeURL(committeeCode)}>
                {committee}
              </External>
            ) : (
              committee
            )}
          </p>
        ) : (
          <></>
        )}
      </TopicHeader>

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
