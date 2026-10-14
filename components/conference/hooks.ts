import { useCallback, useMemo, useState } from "react"
import { useMediaQuery } from "usehooks-ts"
import { useProfile } from "../db"

/**
 * What the pointer is over, and a setter that ignores it on a coarse pointer:
 * a finger has no hover, and iOS sends one on the way to a tap, so there only
 * the tap counts.
 */
export function useHover<T>() {
  const touch = useMediaQuery("(pointer: coarse)")
  const [hovered, setHovered] = useState<T | null>(null)
  const hover = useCallback(
    (value: T | null) => {
      if (!touch) setHovered(value)
    },
    [touch]
  )
  return [hovered, hover] as const
}

/** Member codes of the reader's own representative and senator. */
export function useMyLegislators() {
  const { profile } = useProfile()
  const rep = profile?.representative?.id
  const sen = profile?.senator?.id
  return useMemo(
    () => new Set([rep, sen].filter((id): id is string => Boolean(id))),
    [rep, sen]
  )
}
