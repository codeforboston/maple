import React, { useState } from "react"
import { Toast } from "react-bootstrap"
import { useTranslation } from "next-i18next"

interface Props {
  isSuccessful: boolean
}

function ReportToast({ isSuccessful }: Props) {
  const [show, setShow] = useState(true)
  const onClose = () => setShow(false)
  if (isSuccessful) {
    return <SuccessfulToast show={show} onClose={onClose} />
  } else {
    return <FailedToast show={show} onClose={onClose} />
  }
}
type ToastProps = { show: boolean; onClose: () => void }

function FailedToast({ show, onClose }: ToastProps) {
  const { t } = useTranslation("testimony", {
    keyPrefix: "testimonyItem.toast.failed"
  })
  return (
    <Toast bg="danger" show={show} onClose={onClose} delay={3000} autohide>
      <Toast.Header>{t("header")}</Toast.Header>
      <Toast.Body>{t("body")}</Toast.Body>
    </Toast>
  )
}

function SuccessfulToast({ show, onClose }: ToastProps) {
  const { t } = useTranslation("testimony", {
    keyPrefix: "testimonyItem.toast.successful"
  })
  return (
    <Toast bg="success" show={show} onClose={onClose} delay={3000} autohide>
      <Toast.Header>{t("header")}</Toast.Header>
      <Toast.Body>{t("body")}</Toast.Body>
    </Toast>
  )
}

export default ReportToast
