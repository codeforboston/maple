import React, { useRef } from "react"

import { OverlayTrigger } from "../bootstrap"

const MoreButton = ({ children }: { children: React.ReactChild }) => {
  const menuRef = useRef<HTMLDivElement>(null)
  return (
    <OverlayTrigger
      rootClose
      trigger="click"
      placement="bottom-end"
      overlay={
        <div
          ref={menuRef}
          style={{ position: "absolute", background: "white" }}
        >
          {children}
        </div>
      }
    >
      <button
        style={{ border: "none", background: "none" }}
        aria-label="more actions"
      >
        ...
      </button>
    </OverlayTrigger>
  )
}
