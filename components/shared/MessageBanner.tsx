import { ReactNode } from "react"
import styled from "styled-components"
import { SlimBanner } from "./StyledSharedComponents"

export type Props = {
  heading?: string | ReactNode
  content?: string | ReactNode
  icon?: string
}

/* The slim note (SlimBanner), with the icon, the heading in bold and the
   content beside it. The icons are drawn in white, so the icon is used as a
   mask and takes the note's dark ink instead. */
const SlimMessage = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  text-align: left;

  .icon {
    flex: none;
    width: 1.75rem;
    height: 1.75rem;
    background-color: currentColor;
    -webkit-mask: var(--icon) no-repeat center / contain;
    mask: var(--icon) no-repeat center / contain;
  }

  .heading {
    font-weight: 700;
  }
`

export function MessageBanner({ icon, heading, content }: Props) {
  return (
    <SlimBanner>
      <SlimMessage>
        {icon && (
          <span
            className="icon"
            aria-hidden="true"
            style={{ "--icon": `url("${icon}")` } as React.CSSProperties}
          />
        )}
        <span>
          <span className="heading">{heading}</span> {content}
        </span>
      </SlimMessage>
    </SlimBanner>
  )
}
