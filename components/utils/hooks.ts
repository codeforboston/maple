import { useRef } from "react"

export function useSingleton<T>(create: () => T) {
  const value = useRef<T | null>(null)
  if (!value.current) value.current = create()
  return value
}
