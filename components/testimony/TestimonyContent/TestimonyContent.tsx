import { useMemo } from "react"
import styled from "styled-components"
import { formatTestimony, formatTestimonyDiff } from "../formatting"

export type Props = {
  testimony: string
  previous?: string
  className?: string
}

export const TestimonyContent = styled<Props>(
  ({ testimony, previous, className }) => {
    const htmlContent = useMemo(() => {
      if (previous) return formatTestimonyDiff(testimony, previous) as any
      return formatTestimony(testimony)
    }, [testimony, previous])
    return <div className={className} dangerouslySetInnerHTML={htmlContent} />
  }
)`
  br {
    content: "";
    display: block;
    margin-top: 0.25rem;
  }

  p {
    margin-top: 0rem;
  }

  .added {
    color: var(--bs-green);
  }

  .removed {
    text-decoration: line-through;
    color: var(--bs-red);
  }
`
