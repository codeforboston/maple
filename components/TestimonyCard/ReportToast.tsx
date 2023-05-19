import React, { useState } from "react"
import { Toast } from "react-bootstrap"
import { useTranslation } from "next-i18next"

interface Props {
  isSuccessful: boolean
}

const MESSAGES = {
  header: {
    true: "Success!",
    false: "Failed"
  },
  body: {
    true: "Your report was filed.",
    false: "Your report couldn't be filed. Please try again later."
  },
  bg: {
    true: "success",
    false: "danger"
  }
}

function ReportToast({ isSuccessful }: Props) {
  const [show, setShow] = useState(true)
  const successful = isSuccessful ? "true" : "false"
  const { t } = useTranslation("testimony")
  return (
    <Toast
      bg={MESSAGES.bg[successful]}
      show={show}
      onClose={() => setShow(false)}
      delay={3000}
      autohide
    >
      <Toast.Header>{t("reportToast.successful1", {successful1: MESSAGES["header"][successful]})}</Toast.Header>
      <Toast.Body>{MESSAGES["body"][successful]}</Toast.Body>
    </Toast>
  )
}

export default ReportToast
