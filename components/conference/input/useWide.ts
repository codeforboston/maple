import { RefObject, useEffect, useState } from "react"

/** Whether the element is at least `min` px wide. The mockup asks the card
 * this with a container query; styled-components 5 does not parse those. */
export function useWide(ref: RefObject<HTMLElement | null>, min: number) {
  const [wide, setWide] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const read = () => setWide(el.clientWidth >= min)
    read()
    const ro = new ResizeObserver(read)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, min])
  return wide
}
