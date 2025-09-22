import { doc, getDoc } from "firebase/firestore"
import { Trans, useTranslation } from "next-i18next"
import { useCallback, useEffect, useRef, useState } from "react"
import styled from "styled-components"
import { Col, Container, Image, Row } from "../bootstrap"
import { HearingSidebar } from "./HearingSidebar"
import { Transcriptions } from "./Transcriptions"
import { firestore } from "components/firebase"
import * as links from "components/links"

export const CommitteeButton = styled.button`
  border-radius: 12px;
  font-size: 12px;
`

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
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)

  const handleVideoLoad = () => {
    setVideoLoaded(true)
  }

  function setCurTimeVideo(value: number) {
    videoRef.current ? (videoRef.current.currentTime = value) : null
  }

  const eventId = `hearing-${hearingId}`

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

    setCommitteeCode(docData?.content.HearingHost.CommitteeCode)
    setCommitteeName(docData?.content.Name)
    setDescription(docData?.content.Description)
    setGeneralCourtNumber(docData?.content.HearingHost.GeneralCourtNumber)
    setHearingDate(docData?.content.EventDate)
    setVideoTranscriptionId(docData?.videoTranscriptionId)
    setVideoURL(docData?.videoURL)
  }, [eventId])

  useEffect(() => {
    hearingData()
  }, [hearingData])

  return (
    <Container className="mt-3 mb-3">
      <h1>
        {t("hearing", { ns: "hearing" })} {hearingId}
      </h1>

      <h5 className={`mb-3`}>{description}</h5>

      {committeeName ? (
        <links.External
          href={`https://malegislature.gov/Committees/Detail/${committeeCode}/${generalCourtNumber}`}
        >
          <CommitteeButton
            className={`btn btn-secondary d-flex text-nowrap mt-1 mx-1 p-1`}
          >
            &nbsp; {committeeName} &nbsp;
          </CommitteeButton>
        </links.External>
      ) : (
        <></>
      )}

      <div className={`row mt-4`}>
        <Col className={`col-md-8`}>
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
            <VideoParent className={`my-3`}>
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
            setCurTimeVideo={setCurTimeVideo}
            videoLoaded={videoLoaded}
            videoRef={videoRef}
            videoTranscriptionId={videoTranscriptionId}
          />
        </Col>

        <div className={`col-md-4`}>
          <HearingSidebar
            committeeCode={committeeCode}
            generalCourtNumber={generalCourtNumber}
            hearingDate={hearingDate}
          />
        </div>
      </div>
    </Container>
  )
}
