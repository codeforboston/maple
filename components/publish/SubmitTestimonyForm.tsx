import clsx from "clsx"
import { useState } from "react"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"

import { Col, Image, Row, Spinner, Collapse } from "../bootstrap"
import { Bill, Profile } from "../db"
import * as links from "../links"
import { ChooseStance } from "./ChooseStance"
import { useFormInfo } from "./hooks"
import { KeepNote, KeepNoteMobile } from "./KeepNote"
import { ProgressBar } from "./ProgressBar"
import { PublishTestimony } from "./PublishTestimony"
import { QuickInfo } from "./QuickInfo"
import { Step } from "./redux"
import { SelectLegislatorsCta } from "./SelectLegislatorsCta"
import { ShareTestimony } from "./ShareTestimony"
import { WriteTestimony } from "./WriteTestimony"
import { Trans, useTranslation } from "react-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons"

const Background = styled.div`
  background: var(--bs-white);
  height: 100%;
`

export const SubmitTestimonyForm = () => {
  const form = useFormInfo()
  const isMobile = useMediaQuery("(max-width: 768px)")

  return form.ready ? (
    <Background className="p-0">
      <Row className="px-4">
        <Col xs={12}>
          {isMobile ? (
            <PolicyDetails bill={form.bill} profile={form.profile} />
          ) : null}
        </Col>
      </Row>
      <Row className="g-0 h-100">
        <Col md={9} xs={12} className="px-4">
          <Form step={form.step} bill={form.bill} synced={form.synced} />
        </Col>
        <Col md={3} xs={12}>
          {isMobile ? null : form.step == "position" ? (
            <QuickInfo bill={form.bill} profile={form.profile} />
          ) : (
            <KeepNote currentStep={form.step} />
          )}
        </Col>
      </Row>
    </Background>
  ) : (
    <Spinner animation="border" />
  )
}

const FormContainer = styled.div`
  background: white;
  padding-right: 2rem;
  height: 100%;
  padding-top: 1rem;
`

const Divider = styled.div`
  height: 1px;
  background-color: var(--bs-gray-500);
`

const PolicyDetailsStyle = styled.div`
  color: var(--bs-blue);
  background-color: var(--bs-body-bg);
  font-weight: bolder;
  text-align: center;
  box-shadow: 5px 5px 5px 0px rgba(0, 0, 0, 0.3);
`

const PolicyDetails = ({ bill, profile }: { bill: Bill; profile: Profile }) => {
  const { t } = useTranslation("testimony")
  const [isCollapsed, setCollapsed] = useState(false)

  return (
    <PolicyDetailsStyle className="mb-3 p-3">
      <Collapse in={isCollapsed}>
        <div>
          <QuickInfo bill={bill} profile={profile} />
          <Divider />
        </div>
      </Collapse>

      <div onClick={() => setCollapsed(!isCollapsed)}>
        {isCollapsed ? (
          <div>
            {t("submitTestimonyForm.viewLess")}
            <FontAwesomeIcon icon={faCaretUp} />
          </div>
        ) : (
          <div>
            {t("submitTestimonyForm.viewMore")}
            <FontAwesomeIcon icon={faCaretDown} />
          </div>
        )}
      </div>
    </PolicyDetailsStyle>
  )
}

export const Form = ({
  step,
  bill,
  synced
}: {
  step: Step
  bill: Bill
  synced: boolean
}) => {
  const { t } = useTranslation("testimony")
  const content: Record<Step, React.ReactNode> = {
    position: <ChooseStance />,
    selectLegislators: <SelectLegislatorsCta />,
    write: <WriteTestimony />,
    publish: <PublishTestimony />,
    share: <ShareTestimony />
  }
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <FormContainer>
      <links.Internal
        href={links.maple.bill(bill)}
        className={clsx(!synced && "pe-none")}
      >
        {t("submitTestimonyForm.backToBill", { billId: bill.id })}
      </links.Internal>
      <Overview className="mt-3" />
      {isMobile && (step == "write" || step == "publish" || step == "share") ? (
        <KeepNoteMobile />
      ) : null}
      <ProgressBar className="mt-4 mb-4" currentStep={step} />
      {content[step]}
    </FormContainer>
  )
}

const Overview = ({ className }: { className: string }) => {
  const { t } = useTranslation("testimony")
  return (
    <div className={clsx("d-flex", className)}>
      <Row className="align-items-center">
        <Col md={10} xs={12}>
          <h1>{t("submitTestimonyForm.overview.title")}</h1>
          <Divider className="me-5" />
          <div className="mt-2" style={{ fontWeight: "bolder" }}>
            {t("submitTestimonyForm.overview.description")}
          </div>
        </Col>
        <Col md={2} xs={12}>
          <div className="mx-auto text-center">
            <Image alt="" src="/writing.svg" />
          </div>
        </Col>
      </Row>
    </div>
  )
}
