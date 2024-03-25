import "@fortawesome/fontawesome-svg-core/styles.css"
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { FC, RefObject, useState } from "react"
import { OverlayTrigger, Tooltip } from "react-bootstrap"
import { Placement } from "react-bootstrap/esm/types"

export const QuestionTooltip: FC<
  React.PropsWithChildren<{
    placement: Placement,
    nodeRef: RefObject<HTMLDivElement>
  }>
> = ({ placement, nodeRef, children }) => {
  const [show, setShow] = useState(false);
  const onMouseOver = (s: boolean) => setShow(s);
  return (
    <div ref={nodeRef}>
      <OverlayTrigger
        show={show}
        placement={placement}
        overlay={
          <Tooltip
            onMouseEnter={() => onMouseOver(true)}
            onMouseLeave={() => onMouseOver(false)}
            id="tooltip-text"
          >
            {children}
          </Tooltip>
        }
      >
        <span className="m-1">
          <FontAwesomeIcon
            onMouseEnter={() => onMouseOver(true)}
            onMouseLeave={() => onMouseOver(false)}
            size={"lg"}
            icon={faQuestionCircle}
            className="text-secondary" 
          />
        </span>
      </OverlayTrigger>
    </div>
  )
}
