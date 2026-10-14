import { useEffect, useState } from "react"

/**
 * Reads an attribute on <html> and follows changes to it, so switching skins
 * at runtime (Storybook, or the dev switcher) re-renders whatever reads it.
 */
export const useHtmlAttribute = (name: string, enabled = true) => {
  // Read straight away where there is a document (the layout only renders in
  // the browser), so the first render already has the value and nothing jumps.
  const [value, setValue] = useState<string | null>(() =>
    enabled && typeof document !== "undefined"
      ? document.documentElement.getAttribute(name)
      : null
  )

  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    const read = () => setValue(root.getAttribute(name))
    read()
    const observer = new MutationObserver(read)
    observer.observe(root, { attributes: true, attributeFilter: [name] })
    return () => observer.disconnect()
  }, [name, enabled])

  return value
}
