import React, { useEffect, useRef } from "react"
import styles from "./scrolltrack.module.css"

export type ScrollTrackingItemProps = {
  speed: number
  children: React.ReactNode
  className?: string
}

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
    <div className={`${styles.layer} ${className}`} {...props} ref={layerRef}>
      <div className={`${styles.layerChild}`}>{children}</div>
    </div>
  )
}

