import { doc, getDoc } from "firebase/firestore"
import { Trans, useTranslation } from "next-i18next"
import { useCallback, useEffect, useRef, useState } from "react"
import styled from "styled-components"
import { Col, Container, Image, Row } from "../bootstrap"
import { firestore } from "../firebase"
import * as links from "../links"
import { committeeURL, External } from "../links"
import {
  Back,
  ButtonContainer,
  FeatureCalloutButton
} from "../shared/CommonComponents"
import { HearingSidebar } from "./HearingSidebar"
import { Paragraph, fetchTranscriptionData } from "./transcription"
import { Transcriptions } from "./Transcriptions"

import { useRouter } from "next/router"

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

export const HearingDetails = ({
  hearingId
}: {
  hearingId: string | string[] | undefined
}) => {
  const { t } = useTranslation(["common", "hearing"])
  const [transcriptData, setTranscriptData] = useState<Paragraph[]>([])

  const [videoLoaded, setVideoLoaded] = useState(false)
  const handleVideoLoad = () => {
    setVideoLoaded(true)
  }

  const videoRef = useRef<HTMLVideoElement>(null)
  function setCurTimeVideo(value: number) {
    videoRef.current ? (videoRef.current.currentTime = value) : null
  }

  const router = useRouter()

  console.log("vref current: ", videoRef.current)

  const updateUrlWithTimestamp = () => {
    if (videoRef.current) {
      const timeInSeconds = Math.floor(videoRef.current.currentTime)
      console.log("TIS: ", timeInSeconds)
      router.push(`${hearingId}?t=${timeInSeconds}`, undefined, {
        shallow: true
      })
    }
  }

  useEffect(() => {
    videoRef.current
      ? videoRef.current.addEventListener("pause", updateUrlWithTimestamp)
      : null

    return () => {
      videoRef.current
        ? videoRef.current.removeEventListener("pause", updateUrlWithTimestamp)
        : null
    }
  }, [videoRef.current])

  useEffect(() => {
    const startTime = router.query.t

    const convertToString = (value: string | string[] | undefined): string => {
      if (Array.isArray(value)) {
        return value.join(", ")
      }
      return value ?? ""
    }

    const resultString: string = convertToString(startTime)

    console.log("result string", parseInt(resultString, 10))

    if (startTime && videoRef.current) {
      // if (startTime && videoRef.current) {
      console.log("test 3")
      setCurTimeVideo(parseInt(resultString, 10))
      // Wait for video metadata to load before seeking
      videoRef.current.addEventListener("loadedmetadata", () => {
        // if (videoRef.current !== null)
        //   videoRef.current.currentTime = parseInt(resultString, 10)
        // console.log("test 2", videoRef.current.currentTime)
      })
    }
  }, [router.query.t, videoRef.current])

  const eventId = `hearing-${hearingId}`

  const [billsInAgenda, setBillsInAgenda] = useState([])
  const [committeeCode, setCommitteeCode] = useState("")
  const [committeeName, setCommitteeName] = useState("")
  const [description, setDescription] = useState("")
  const [generalCourtNumber, setGeneralCourtNumber] = useState("")
  const [hearingDate, setHearingDate] = useState("")
  const [videoTranscriptionId, setVideoTranscriptionId] = useState("")
  const [videoURL, setVideoURL] = useState("")

  const hearingData = useCallback(async () => {
    const hearing = await getDoc(doc(firestore, `events/${eventId}`))
    const docData = hearing.data()

    setBillsInAgenda(docData?.content.HearingAgendas[0]?.DocumentsInAgenda)
    setCommitteeCode(docData?.content.HearingHost.CommitteeCode)
    setCommitteeName(docData?.content.Name)
    setDescription(docData?.content.Description)
    setGeneralCourtNumber(docData?.content.HearingHost.GeneralCourtNumber)
    setHearingDate(docData?.content.EventDate)
    setVideoTranscriptionId(docData?.videoTranscriptionId)
    setVideoURL(docData?.videoURL)
  }, [eventId])

  useEffect(() => {
    ;(async function () {
      if (!videoTranscriptionId || transcriptData.length !== 0) return
      const docList = await fetchTranscriptionData(videoTranscriptionId)
      setTranscriptData(docList)
    })()
  }, [videoTranscriptionId])

  useEffect(() => {
    hearingData()
  }, [hearingData])

  return (
    <Container className="mt-3 mb-3">
      <Row className={`mb-3`}>
        <Col>
          <Back href="/hearings">{t("back_to_hearings")}</Back>
        </Col>
      </Row>

      {transcriptData ? (
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
        <h1>
          <External href={committeeURL(committeeCode)}>
            {committeeName}
          </External>
        </h1>
      ) : (
        <></>
      )}

      <h5 className={`mb-3`}>{description}</h5>

      <Row>
        <Col className={`col-md-8 mt-4`}>
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

          {videoURL ? (
            <VideoParent className={`mt-3`}>
              <VideoChild
                ref={videoRef}
                src={videoURL}
                onLoadedData={handleVideoLoad}
                controls
                muted
              />
            </VideoParent>
          ) : (
            <LegalContainer className={`fs-6 fw-bold my-3 py-2 rounded`}>
              {t("no_video_on_file", { ns: "hearing" })}
            </LegalContainer>
          )}

          <Transcriptions
            transcriptData={transcriptData}
            setCurTimeVideo={setCurTimeVideo}
            videoLoaded={videoLoaded}
            videoRef={videoRef}
          />
        </Col>

        <div className={`col-md-4`}>
          <HearingSidebar
            billsInAgenda={billsInAgenda}
            committeeCode={committeeCode}
            generalCourtNumber={generalCourtNumber}
            hearingDate={hearingDate}
            hearingId={hearingId}
            transcriptData={transcriptData}
          />
        </div>
      </Row>
    </Container>
  )
}
