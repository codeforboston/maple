import React, { useEffect, useRef } from "react"
import styled from "styled-components"

export type ScrollTrackingItemProps = {
  speed: number
  children: React.ReactNode
  className?: string
}

const LayerChild = styled.div`
  transform: translateY(
    calc(var(--scroll-speed-ratio) * var(--scroll-position))
  );
`

export default function ScrollTrackingItem({
  speed,
  children,
  className,
  ...props
}: ScrollTrackingItemProps) {
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    layerRef.current?.style.setProperty("--scroll-speed-ratio", `${speed}`)
  }, [speed])

  return (
    <div
      className={`position-absolute top-0 end-0 bottom-0 start-0 ${className}`}
      {...props}
      ref={layerRef}
    >
      <LayerChild
        className={`position-relative top-0 end-0 bottom-0 start-0 d-grid`}
      >
        {children}
      </LayerChild>
    </div>
  )
}
