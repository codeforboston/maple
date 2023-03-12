import { AttachmentLink } from "components/CommentModal/Attachment"
import { TestimonyContent } from "components/testimony"
import { ReactNode } from "react"
import styled from "styled-components"
import { Position, useDraftTestimonyAttachmentInfo } from "../db"
import { usePublishState } from "./hooks"
import { CopyTestimony } from "./ShareTestimony"

export const positionActions: Record<Position, ReactNode> = {
  neutral: (
    <span>
      are <b className="neutral-position">neutral</b> on
    </span>
  ),
  endorse: <b className="endorse-position">support</b>,
  oppose: <b className="oppose-position">oppose</b>
}

export const YourTestimony = styled(({ className, children }) => {
  return (
    <div className={className}>
      <div className="d-flex justify-content-between mb-2">
        <div className="title">Your Testimony</div>
        <CopyTestimony />
      </div>
      <TestimonyPreview />
    </div>
  )
})`
  border-radius: 1rem;

  .title {
    font-size: 1.25rem;
  }
`

export const TestimonyPreview = styled(props => {
  const { position, content, attachmentId, authorUid } = usePublishState()
  const info = useDraftTestimonyAttachmentInfo(authorUid, attachmentId)

  return (
    <div {...props}>
      {position && (
        <p className="text-center">You {positionActions[position]} this bill</p>
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
})`
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
