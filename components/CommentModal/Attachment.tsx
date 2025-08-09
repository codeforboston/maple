import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ChangeEventHandler, useCallback, useEffect, useState } from "react"
import { Button, Col, Form, InputGroup, Row, Spinner } from "../bootstrap"
import { AttachmentInfo, UseDraftTestimonyAttachment } from "../db"
import { External } from "../links"
import { useTranslation } from "next-i18next"

export function Attachment({
  attachment,
  className,
  confirmRemove = false
}: {
  attachment: UseDraftTestimonyAttachment
  className?: string
  confirmRemove?: boolean
}) {
  const { upload, error, id } = attachment
  const [key, setKey] = useState(0),
    clearInput = useCallback(() => setKey(s => s + 1), [])
  const onFileSelected: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      const files = e.target.files
      if (files?.length) {
        const file = files[0]
        upload(file)
      }
    },
    [upload]
  )

  useEffect(() => {
    if (error) clearInput()
  }, [clearInput, error])

  return (
    <Form.Group className={className} controlId="testimonyAttachment">
      <Label attachment={attachment} />
      {id ? (
        <Attached attachment={attachment} confirmRemove={confirmRemove} />
      ) : (
        <InputGroup>
          <Form.Control
            key={key}
            type="file"
            accept="application/pdf"
            onChange={onFileSelected}
          />
        </InputGroup>
      )}
      <StatusMessage attachment={attachment} />
    </Form.Group>
  )
}

const formatSize = (size: number) => {
  if (size > 1e6) {
    return `${(size * 1e-6).toFixed(1)} MB`
  } else {
    return `${(size * 1e-3).toFixed(1)} KB`
  }
}

const Label = ({
  attachment: { status }
}: {
  attachment: UseDraftTestimonyAttachment
}) => {
  const { t } = useTranslation("attachment")
  return (
    <Form.Label>
      <span className="me-1">{t("provide_testimony_as_file")}</span>
      {status === "loading" && <Spinner animation="border" size="sm" />}
      {status === "error" && (
        <FontAwesomeIcon icon={faExclamationTriangle} className="text-danger" />
      )}
    </Form.Label>
  )
}

export const AttachmentLink = ({
  attachment: { size, url, name },
  className
}: {
  attachment: AttachmentInfo
  className?: string
}) => {
  const { t } = useTranslation("attachment")
  const linkLabelParts = [t("attached"), name ?? t("testimony")]
  if (size) linkLabelParts.push(formatSize(size))
  const linkLabel = linkLabelParts.join(" - ")
  return (
    <External className={className} href={url}>
      {linkLabel}
    </External>
  )
}

const Attached = ({
  attachment,
  confirmRemove
}: {
  attachment: UseDraftTestimonyAttachment
  confirmRemove: boolean
}) => {
  const { t } = useTranslation("attachment")
  const { url, name, size, id, remove, status } = attachment
  const onClick = () => {
    if (!confirmRemove || confirm(t("confirm_remove"))) remove()
  }
  return (
    <Row className="align-items-center">
      <Col md="auto">
        {url && size && name && id ? (
          <AttachmentLink attachment={{ url, size, name, id }} />
        ) : null}
      </Col>
      <Col>
        <Button
          variant="secondary"
          className="py-1 px-2"
          onClick={onClick}
          disabled={status === "loading"}
        >
          {t("remove")}
        </Button>
      </Col>
    </Row>
  )
}

const StatusMessage = ({
  attachment: { id, error, status }
}: {
  attachment: UseDraftTestimonyAttachment
}) => {
  const { t } = useTranslation("attachment")
  if (status === "error") {
    let message: string
    if (error?.code === "storage/unauthorized") {
      message = t("error.storage_unauthorized")
    } else {
      message = t("error.generic")
    }

    return <Form.Text className="text-danger">{message}</Form.Text>
  } else if (status === "ok" && !id) {
    return <Form.Text>{t("file_requirements")}</Form.Text>
  } else {
    return null
  }
}
