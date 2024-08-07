import { ReactNode, useEffect, useRef } from "react"
import styles from "./scrolltrack.module.css"

export type ScrollTrackerContainerProps = {
  className?: string
  children: ReactNode
}

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
    <div
      {...props}
      className={`${styles.scrollContainer} ${className}`}
      ref={containerRef}
    >
      {children}
    </div>
  )
}
