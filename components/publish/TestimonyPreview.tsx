import { faCopy } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import clsx from "clsx"
import { AttachmentLink } from "components/CommentModal/Attachment"
import { TestimonyContent } from "components/testimony"
import { ReactNode, useEffect, useRef, useState } from "react"
import styled from "styled-components"
import { CopyButton } from "../buttons"
import {
  getDraftTestimonyAttachmentInfo,
  Position,
  getPublishedTestimonyAttachmentInfo,
  AttachmentInfo
} from "../db"
import { usePublishState, useTestimonyEmail } from "./hooks"
import { useTranslation, Trans } from "next-i18next"

export const positionActions = (
  t: (key: string) => string
): Record<Position, ReactNode> => ({
  neutral: (
    <Trans i18nKey="testimony:preview.neutral">
      You are <b className="neutral-position">neutral</b> on this bill
    </Trans>
  ),
  endorse: (
    <Trans i18nKey="testimony:preview.endorse">
      You <b className="endorse-position">support</b> this bill
    </Trans>
  ),
  oppose: (
    <Trans i18nKey="testimony:preview.oppose">
      You <b className="oppose-position">oppose</b> this bill
    </Trans>
  )
})

export const CopyTestimony = styled(props => {
  const email = useTestimonyEmail()
  const { t } = useTranslation("testimony")
  return (
    <CopyButton
      variant="outline-secondary"
      text={email.body ?? ""}
      disabled={!email.body}
      className={clsx("copy-btn", props.className)}
    >
      <FontAwesomeIcon icon={faCopy} /> {t("preview.copyEmailBody")}
    </CopyButton>
  )
})`
  padding: 0.25rem 0.5rem;
`

export const YourTestimony = styled<{ type: "draft" | "published" }>(
  ({ className, children, type }) => {
    const { t } = useTranslation("testimony")
    return (
      <div className={className}>
        <div className="d-flex justify-content-between mb-2">
          <div className="title fs-4">{t("yourTestimony.title")}</div>
          <CopyTestimony />
        </div>
        <TestimonyPreview type={type} />
      </div>
    )
  }
)`
  border-radius: 1rem;
`

export const TestimonyPreview = styled<{ type: "draft" | "published" }>(
  props => {
    const { draft, publication, authorUid } = usePublishState()
    const { t } = useTranslation("testimony")
    const { position, content, attachmentId } =
      (props.type === "draft" ? draft : publication) ?? {}

    const [info, setAttachmentInfo] = useState<AttachmentInfo | undefined>()
    useEffect(() => {
      if (authorUid && attachmentId) {
        const info =
          props.type === "draft"
            ? getDraftTestimonyAttachmentInfo(authorUid, attachmentId)
            : getPublishedTestimonyAttachmentInfo(attachmentId)
        info.then(i => setAttachmentInfo(i))
      }
    }, [attachmentId, authorUid, props.type])

    return (
      <div {...props}>
        {position && (
          <p className="text-center">{positionActions(t)[position]}</p>
        )}
        {content && (
          <div className="content-section">
            <TestimonyContent testimony={content} />
          </div>
        )}
        {info && (
          <AttachmentLink className="mt-3 attachment-link" attachment={info} />
        )}
      </div>
    )
  }
)`
  border-radius: 1rem;
  background: var(--bs-body-bg);
  padding: 1rem;

  .content-section {
    overflow-y: auto;
    max-height: 70vh;
    overflow-wrap: break-word;
    padding-right: 0.25rem;
    margin-right: -0.75rem;

    ::-webkit-scrollbar {
      width: 12px;
      border-radius: 1rem;
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 1rem;
      background: rgba(0, 0, 0, 0.3);

      :hover {
        background: rgba(0, 0, 0, 0.6);
      }
    }
  }

  a {
    color: currentColor;
  }

  .attachment-link {
    display: block;
  }
`

const clampString = (s: string | undefined, maxLength: number) => {
  if (!s) return undefined

  const words = s.split(" ")
  let length = 0
  for (let i = 0; i < words.length; i++) {
    length += words[i].length + (length > 0 ? 1 : 0)
    if (length > maxLength) {
      return words.slice(0, i).join(" ") + "…"
    }
  }
  return s
}
