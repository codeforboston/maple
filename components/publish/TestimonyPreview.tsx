import { ReactNode } from "react"
import styled from "styled-components"
import { Position } from "../db"
import { usePublishState } from "./redux"

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

export const TestimonyPreview = styled(() => {
  const { position, content } = usePublishState()
  const snippet = clampString(content, maxLength)

  return (
    <>
      {position && (
        <p className="position-section">
          You {positionActions[position]} this bill
        </p>
      )}
      {snippet && <p className="content-section">“{snippet}”</p>}
    </>
  )
})``

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
