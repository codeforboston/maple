import React, { useState } from "react"
import { Button, FloatingLabel, Form, Modal } from "react-bootstrap"
import { useTranslation } from "next-i18next"

type Props = {
  reasons: string[]
  onClose: () => void
  onReport: (report: { reason: string; additionalInformation: string }) => void
  isLoading: boolean
}

export function ReportModal({ reasons, onClose, onReport, isLoading }: Props) {
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

  const { t } = useTranslation("testimony")

  return (
    <Modal show onHide={onClose}>
      <Form validated={false} onSubmit={handleReport}>
        <Modal.Header closeButton>
          {t("reportModal.reportTestimony")}
        </Modal.Header>
        <Modal.Body>
          <Form.Group as="fieldset">
            <legend>
              {t("reportModal.reason")}
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

          <FloatingLabel controlId="additional-info" label="Additional info">
            <Form.Control
              as="textarea"
              placeholder="There's some personal information here."
              maxLength={200}
              style={{ height: "100px" }}
              value={additionalInformation}
              onChange={event => {
                setAdditionalInformation(event.target.value)
              }}
            />
          </FloatingLabel>
          <div className="text-muted">
            {additionalInformation.length}/200 characters
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            {t("reportModal.close")}
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? t("reportModal.reporting") : t("reportModal.report")}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
