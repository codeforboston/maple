import React, { useEffect, useRef } from "react"
import styles from "./Parallax.module.css"

export type ParallaxRowProps = {
  speed: number
  children: React.ReactNode
  className?: string
}

export function ScrollTrackingItem({
  speed,
  children,
  className,
  ...props
}: ParallaxRowProps) {
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

