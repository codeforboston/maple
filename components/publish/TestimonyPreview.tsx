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
  getPublishedTestimonyAttachmentInfo,
  AttachmentInfo
} from "../db"
import { usePublishState, useTestimonyEmail } from "./hooks"
import { Position } from "common/testimony/types"

export const positionActions: Record<Position, ReactNode> = {
  neutral: (
    <span>
      are <b className="neutral-position">neutral</b> on
    </span>
  ),
  endorse: <b className="endorse-position">support</b>,
  oppose: <b className="oppose-position">oppose</b>
}

export const CopyTestimony = styled(props => {
  const email = useTestimonyEmail()
  return (
    <CopyButton
      variant="outline-secondary"
      text={email.body ?? ""}
      disabled={!email.body}
      className={clsx("copy-btn", props.className)}
    >
      <FontAwesomeIcon icon={faCopy} /> Copy Email Body
    </CopyButton>
  )
})`
  padding: 0.25rem 0.5rem;
`

export const YourTestimony = styled<{ type: "draft" | "published" }>(
  ({ className, children, type }) => {
    return (
      <div className={className}>
        <div className="d-flex justify-content-between mb-2">
          <div className="title fs-4">Your Testimony</div>
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
          <p className="text-center">
            You {positionActions[position]} this bill
          </p>
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
