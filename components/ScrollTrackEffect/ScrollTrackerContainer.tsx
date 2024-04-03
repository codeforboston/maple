import React, { ReactNode, useEffect, useRef } from "react"
import styled from "styled-components"

export type ScrollTrackerContainerProps = {
  className?: string
  children: ReactNode
}

const ScrollWrapper = styled.div`
  --scroll-position: 0;
`

export default function ScrollTrackerContainer({
  className,
  children,
  ...props
}: ScrollTrackerContainerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const onScroll = () => {
    containerRef.current?.style.setProperty(
      "--scroll-position",
      `${window.scrollY}px`
    )
  }

  useEffect(() => {
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <ScrollWrapper
      {...props}
      className={`position-relative top-0 end-0 bottom-0 start-0 bg-secondary ${className}`}
      ref={containerRef}
    >
      {children}
    </ScrollWrapper>
  )
}
