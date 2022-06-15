import { ReactNode, useEffect, useRef } from "react"
import styles from "./Parallax.module.css"

export type ParallaxContainerProps = {
  className: string
  children: ReactNode
}

export default function ScrollTrackerContainer({
  className,
  children,
  ...props
}: ParallaxContainerProps) {
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
