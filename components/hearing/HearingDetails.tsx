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
import {
  HearingData,
  Paragraph,
  fetchHearingData,
  fetchTranscriptionData
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

export const HearingDetails = ({
  hearingData: {
    billsInAgenda,
    committeeCode,
    committeeName,
    description,
    generalCourtNumber,
    hearingDate,
    hearingId,
    videoTranscriptionId,
    videoURL
  }
}: {
  hearingData: HearingData
}) => {
  const { t } = useTranslation(["common", "hearing"])
  const [transcriptData, setTranscriptData] = useState<Paragraph[] | null>(null)

  const [videoLoaded, setVideoLoaded] = useState(false)
  const handleVideoLoad = () => {
    setVideoLoaded(true)
  }

  const videoRef = useRef<HTMLVideoElement>(null)
  function setCurTimeVideo(value: number) {
    videoRef.current ? (videoRef.current.currentTime = value) : null
  }

  useEffect(() => {
    ;(async function () {
      if (!videoTranscriptionId || transcriptData !== null) return
      const docList = await fetchTranscriptionData(videoTranscriptionId)
      setTranscriptData(docList)
    })()
  }, [videoTranscriptionId])

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
        committeeCode ? (
          <h1>
            <External href={committeeURL(committeeCode)}>
              {committeeName}
            </External>
          </h1>
        ) : (
          <h1>
            {committeeName}
          </h1>
        )
      ) : (
        <></>
      )}

      <h5 className={`mb-3`}>{description}</h5>

      <Row>
        <Col className={`col-md-8 mt-4`}>
          {transcriptData ? (
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

          {transcriptData ? (
            <Transcriptions
              transcriptData={transcriptData}
              setCurTimeVideo={setCurTimeVideo}
              videoLoaded={videoLoaded}
              videoRef={videoRef}
            />
          ) : (
            <LegalContainer className={`fs-6 fw-bold mb-2 py-2 rounded-bottom`}>
              <div>{t("transcription_not_on_file", { ns: "hearing" })}</div>
            </LegalContainer>
          )}
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
