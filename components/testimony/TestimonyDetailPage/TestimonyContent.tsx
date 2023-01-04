import { diffChars } from "diff"
import { useMemo } from "react"
import styled from "styled-components"
import { formatTestimony } from "../formatting"
import { Revision } from "./testimonyDetailSlice"

export const TestimonyContent = styled<Revision>(
  ({ content, previous, className }) => {
    const htmlContent = useMemo(
      () => formatRevision(content, previous?.content),
      [content, previous?.content]
    )
    return <div className={className} dangerouslySetInnerHTML={htmlContent} />
  }
)`
  .added {
    color: var(--bs-green);
  }

  .removed {
    text-decoration: line-through;
    color: var(--bs-red);
  }
`

export const formatRevision = (
  currentContent: string,
  previousContent?: string
) => {
  let content: string
  if (previousContent) {
    const diff = diffChars(previousContent, currentContent)
    content = diff
      .map(change => {
        if (change.added) return `<span class="added">${change.value}</span>`
        else if (change.removed)
          return `<span class="removed">${change.value}</span>`
        else return change.value
      })
      .join("")
    console.log(content, diff)
  } else {
    content = currentContent
  }
  return formatTestimony(content)
}
