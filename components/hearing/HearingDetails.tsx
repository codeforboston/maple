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

const StyledContainer = styled(Container)`
  font-family: "Nunito";
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
  const { t } = useTranslation("common")

  const videoRef = useRef<HTMLVideoElement>(null)
  function setCurTimeVideo(value: number) {
    videoRef.current ? (videoRef.current.currentTime = value) : null
  }

  const hearingQuery = `hearing-${hearingId}`

  const [committeeCode, setCommitteeCode] = useState("")
  const [committeeName, setCommitteeName] = useState("")
  const [description, setDescription] = useState("")
  const [generalCourtNumber, setGeneralCourtNumber] = useState("")
  const [hearingDate, setHearingDate] = useState("")
  const [videoTranscriptionId, setVideoTranscriptionId] = useState("")
  const [videoURL, setVideoURL] = useState("")

  const hearingData = useCallback(async () => {
    const hearing = await getDoc(doc(firestore, `events/${hearingQuery}`))
    const docData = hearing.data()

    setCommitteeCode(
      docData?.content.HearingHost.CommitteeCode ?? "Default Committee Code"
    )
    setCommitteeName(docData?.content.Name ?? "Default Name")
    setDescription(docData?.content.Description)
    setGeneralCourtNumber(
      docData?.content.HearingHost.GeneralCourtNumber ??
        "Default General Court Number"
    )
    setHearingDate(docData?.content.EventDate ?? "Default Date")
    setVideoTranscriptionId(
      docData?.videoTranscriptionId ?? "Default Video Transcripton Id"
    )
    setVideoURL(docData?.videoURL)
  }, [hearingQuery])

  useEffect(() => {
    hearingData()
  }, [hearingData])

  let committeeCheck = true
  if (committeeName == "Default Name") {
    committeeCheck = false
  }

  return (
    <StyledContainer className="mt-3 mb-3">
      <h1>
        {t("hearing")} {hearingId}
      </h1>

      <h5 className={`mb-3`}>{description}</h5>

      {committeeCheck ? (
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
              <VideoChild ref={videoRef} src={videoURL} controls muted />
            </VideoParent>
          ) : (
            <LegalContainer className={`fs-6 fw-bold my-3 py-2 rounded`}>
              {t("no_video_on_file")}
            </LegalContainer>
          )}

          <Transcriptions
            setCurTimeVideo={setCurTimeVideo}
            videoTranscriptionId={videoTranscriptionId}
          />
        </Col>

        <div className={`col-md-4`}>
          <HearingSidebar
            committeeCheck={committeeCheck}
            committeeCode={committeeCode}
            generalCourtNumber={generalCourtNumber}
            hearingDate={hearingDate}
          />
        </div>
      </div>
    </StyledContainer>
  )
}
