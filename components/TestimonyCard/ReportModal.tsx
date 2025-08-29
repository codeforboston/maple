import React, { useState } from "react"
import { Button, FloatingLabel, Form, Modal } from "react-bootstrap"
import { useTranslation } from "next-i18next"

type Props = {
  reasons: string[]
  onClose: () => void
  onReport: (report: { reason: string; additionalInformation: string }) => void
  isLoading: boolean

  additionalInformationLabel: string
  requireAdditionalInformation?: boolean
  children?: string | React.ReactNode
}

const ADDITIONAL_INFO_MAX_LENGTH_CHARS = 300

export function ReportModal({
  reasons,
  onClose,
  onReport,
  isLoading,
  additionalInformationLabel,
  requireAdditionalInformation = false,
  children
}: Props) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [additionalInformation, setAdditionalInformation] = useState<string>("")
  const [validationError, setValidationError] = useState<string>("")
  function handleReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedReason) {
      setValidationError("Please choose a reason.")
    } else {
      setValidationError("")
      onClose()
      onReport({
        reason: selectedReason,
        additionalInformation
      })
    }
  }

  const { t } = useTranslation("testimony", { keyPrefix: "reportModal" })
  const { t: tCommon } = useTranslation("common")

  return (
    <Modal show onHide={onClose}>
      <Form validated={false} onSubmit={handleReport}>
        <Modal.Header closeButton>{t("reportTestimony")}</Modal.Header>
        <Modal.Body>
          {children}
          <Form.Group as="fieldset">
            <legend>
              {t("reason")}
              <span style={{ color: "red" }}>*</span>
            </legend>
            {reasons.map(reason => {
              return (
                <Form.Check
                  key={reason}
                  id={`report-check-${reason}`}
                  type={"radio"}
                  label={reason}
                  checked={reason === selectedReason}
                  onChange={() => {
                    setSelectedReason(reason)
                  }}
                  required
                />
              )
            })}
            {/* 
            TODO: find a way to integrate with browser form validation.
            See: https://react-bootstrap.github.io/forms/validation/#native-html5-form-validation
            */}
            <div className="invalid-feedback" style={{ display: "block" }}>
              {validationError || <>&nbsp;</>}
            </div>
          </Form.Group>
          {/* label="Additional info" */}
          <FloatingLabel
            controlId="additional-info"
            label={additionalInformationLabel}
          >
            <Form.Control
              as="textarea"
              placeholder="There's some personal information here."
              maxLength={ADDITIONAL_INFO_MAX_LENGTH_CHARS}
              style={{ height: "100px" }}
              value={additionalInformation}
              onChange={event => {
                setAdditionalInformation(event.target.value)
              }}
              required={requireAdditionalInformation}
            />
          </FloatingLabel>
          <div className="text-muted">
            {additionalInformation.length}/{ADDITIONAL_INFO_MAX_LENGTH_CHARS} {tCommon("characters")}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            {t("close")}
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? t("reporting") : t("report")}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export function RequestDeleteOwnTestimonyModal({
  onClose,
  onReport,
  isLoading
}: Pick<Props, "onClose" | "onReport" | "isLoading">) {
  const { t } = useTranslation("testimony", {
    keyPrefix: "reportModal"
  })
  return (
    <ReportModal
      onClose={onClose}
      onReport={onReport}
      isLoading={isLoading}
      reasons={[
        t("wrongBill"),
        t("sensitiveInformation"),
        t("userBelow18YearsOld"),
        t("other")
      ]}
      additionalInformationLabel={t("reason")}
      requireAdditionalInformation
    >
      {t("rescind")}
    </ReportModal>
  )
}
