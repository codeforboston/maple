import { doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/router"
import { Trans, useTranslation } from "next-i18next"
import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { Col, Container, Image, Row } from "../bootstrap"
import { firestore } from "components/firebase"
import * as links from "components/links"

const CommitteeButton = styled.button`
  border-radius: 12px;
  font-size: 12px;
`

const LegalContainer = styled(Container)`
  background-color: white;
  border-radius: 0.75rem;
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
  const hearingQuery = `hearing-${hearingId}`

  const [committeeCode, setCommitteeCode] = useState("")
  const [committeeName, setCommitteeName] = useState("")
  const [generalCourtNumber, setGeneralCourtNumber] = useState("")
  const [videoTranscriptionId, setVideoTranscriptionId] = useState("")
  const [videoURL, setVideoURL] = useState("")

  const hearingData = useCallback(async () => {
    const hearing = await getDoc(doc(firestore, `events/${hearingQuery}`))
    const docData = hearing.data()

    setCommitteeCode(
      docData?.content.HearingHost.CommitteeCode ?? "Default Committee Code"
    )
    setCommitteeName(docData?.content.Name ?? "Default Name")
    setGeneralCourtNumber(
      docData?.content.HearingHost.GeneralCourtNumber ??
        "Default General Court Number"
    )
    setVideoTranscriptionId(
      docData?.videoTranscriptionId ?? "Default Video Transcripton Id"
    )
    setVideoURL(docData?.videoURL ?? "Default URL")

    console.log("data: ", docData)
    console.log("content: ", docData?.content)
  }, [hearingQuery])

  useEffect(() => {
    hearingData()
  }, [hearingData])

  const router = useRouter()
  useEffect(() => {
    if (videoURL === "Default URL") {
      router.push({ pathname: "/404" })
    }
  }, [router, videoURL])

  // pathname: "/404" could possible replaced with a different
  // page/sequence/message that's more specific to the problem
  // i.e. "the hearing ID you're trying to reach is not on file,
  // please choose another"
  //
  // see pages/bills/[court]/[billId.tsx] ln 32 - 35 for possible
  // improved method

  console.log("Id: ", videoTranscriptionId)

  return (
    <StyledContainer className="mt-3 mb-3">
      <h1>
        {t("hearing")} {hearingId}
      </h1>

      <links.External
        href={`https://malegislature.gov/Committees/Detail/${committeeCode}/${generalCourtNumber}`}
      >
        <CommitteeButton
          className={`btn btn-secondary d-flex text-nowrap mt-1 mx-1 p-1`}
        >
          &nbsp; {committeeName} &nbsp;
        </CommitteeButton>
      </links.External>
      <div className={`row mt-4`}>
        <Col className={`col-md-8`}>
          <LegalContainer className={`pb-2`}>
            <Row
              className={`d-flex align-items-center justify-content-between`}
              fontSize={"12px"}
              xs="auto"
            >
              <Col className={`mt-1`}>
                <div className={`fs-6 fw-bold mt-1`}>
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

              <Col className={`mt-1`}>
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
          <VideoParent className={`my-3`}>
            <VideoChild src={videoURL} controls />
          </VideoParent>
          <LegalContainer className={`my-3`}>
            Transcriptions go here
          </LegalContainer>
        </Col>
        <div className={`col-md-4`}>
          <LegalContainer className={`py-4`}>
            <p>2nd Column Placeholder</p>
            <p>replace me with sidebar</p>
          </LegalContainer>
        </div>
      </div>
    </StyledContainer>
  )
}
