import { AttachmentLink } from "components/CommentModal/Attachment"
import { TestimonyContent } from "components/testimony"
import { ReactNode } from "react"
import styled from "styled-components"
import { Position, useDraftTestimonyAttachmentInfo } from "../db"
import { usePublishState } from "./hooks"

const maxLength = 1000

export const positionActions: Record<Position, ReactNode> = {
  neutral: (
    <span>
      are <b className="neutral-position">neutral</b> on
    </span>
  ),
  endorse: <b className="endorse-position">endorse</b>,
  oppose: <b className="oppose-position">oppose</b>
}

export const YourTestimony = styled(({ className, children }) => {
  return (
    <div className={className}>
      {children}
      <div className="title">Your Testimony</div>
      <TestimonyPreview />
    </div>
  )
})`
  @media (min-width: 768px) {
    padding: 3rem 4rem 3rem 4rem !important;
  }

  color: white;
  padding: 1rem;
  background-color: var(--bs-blue);
  border-radius: 1rem;

  .attachment-link {
    color: white;
  }

  .title {
    font-weight: bold;
    font-size: 1.25rem;
    text-align: center;
    margin-bottom: 1rem;
  }
`

export const TestimonyPreview = styled(props => {
  const { position, content, attachmentId, authorUid } = usePublishState()
  const snippet = clampString(content, maxLength)
  const info = useDraftTestimonyAttachmentInfo(authorUid, attachmentId)

  return (
    <div {...props}>
      {position && (
        <p className="text-center">You {positionActions[position]} this bill</p>
      )}
      {snippet && (
        <div className="content-section">
          <TestimonyContent testimony={snippet} />
        </div>
      )}
      {info && <AttachmentLink className="attachment-link" attachment={info} />}
    </div>
  )
})`
  .content-section {
    overflow-x: auto;

    a {
      color: currentColor;
    }
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
