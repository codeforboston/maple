import { useMemo } from "react"
import styled from "styled-components"
import { formatTestimony, formatTestimonyDiff } from "../formatting"
import { Revision } from "./testimonyDetailSlice"

export const TestimonyContent = styled<Revision & { showDiff?: boolean }>(
  ({ content, previous, className, showDiff }) => {
    const prevContent = previous?.content
    const htmlContent = useMemo(() => {
      if (showDiff && prevContent)
        return formatTestimonyDiff(content, prevContent) as any
      return formatTestimony(content)
    }, [content, prevContent, showDiff])
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
