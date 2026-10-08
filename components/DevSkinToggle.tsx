import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { EXPLORERS } from "./Navbar"

/**
 * Development only: switches in the bottom-left corner for the skin and for
 * whether the explorers' artwork shows, set as attributes on <html>, so every
 * combination can be compared in the running app without editing
 * pages/_document.tsx. Choices are remembered in this browser. The artwork
 * switch sets data-maple-art, which components/shared/PageArt.tsx and the
 * other explorer art read.
 *
 * Never shipped: pages/_app.tsx only imports this behind a NODE_ENV check that
 * Next.js replaces with a constant at build time, so production bundles drop
 * it. The check below is a second guard in case it is ever imported directly.
 */

/**
 * Each option sets one or more attributes on <html>; null removes one. The
 * "mixed" skin is the Digital Democracy skin plus data-maple-nav="mixed",
 * which components/Navbar.tsx reads: neutral bar on the homepage, blue
 * everywhere else.
 */
type Option = {
  value: string
  label: string
  attributes: Record<string, string | null>
  /** Paths where the option is left out because it looks the same as
   * another there (sameAs); while it is chosen, that one shows as chosen. */
  hideOn?: string[]
  sameAs?: string
}

type Control = {
  label: string
  storageKey: string
  options: Option[]
  /** Paths the switch shows on; everywhere if left out. */
  onlyOn?: string[]
}

const CONTROLS: Control[] = [
  {
    label: "Skin",
    storageKey: "maple-dev-skin",
    options: [
      {
        value: "maple",
        label: "Maple",
        attributes: { "data-maple-theme": "maple", "data-maple-nav": null }
      },
      {
        value: "dd",
        label: "Digital Democracy",
        attributes: { "data-maple-theme": "dd", "data-maple-nav": null }
      },
      {
        value: "mixed",
        label: "Mixed",
        // On the homepage Mixed has Digital Democracy's neutral bar too.
        hideOn: ["/"],
        sameAs: "dd",
        attributes: { "data-maple-theme": "dd", "data-maple-nav": "mixed" }
      }
    ]
  },
  {
    label: "Art",
    storageKey: "maple-dev-art",
    // The artwork is only on the explorers.
    onlyOn: EXPLORERS,
    options: [
      {
        value: "off",
        label: "Regular Background",
        attributes: { "data-maple-art": "off" }
      },
      {
        value: "on",
        label: "Background Art",
        attributes: { "data-maple-art": null }
      }
    ]
  }
]

const readStored = (key: string) => {
  try {
    return window.localStorage.getItem(key)
  } catch {
    // Storage can be unavailable; fall back to the rendered attributes.
    return null
  }
}

/** The option whose attributes all match what <html> currently has. */
const renderedOption = (control: Control) =>
  control.options.find(option =>
    Object.entries(option.attributes).every(
      ([name, value]) => document.documentElement.getAttribute(name) === value
    )
  )

function Switch({ control, pathname }: { control: Control; pathname: string }) {
  const [value, setValue] = useState<string | null>(null)

  // Start from whatever is remembered, else whatever _document rendered, else
  // the first option.
  useEffect(() => {
    const stored = readStored(control.storageKey)
    const remembered = control.options.find(option => option.value === stored)
    setValue(
      (remembered ?? renderedOption(control) ?? control.options[0]).value
    )
  }, [control])

  useEffect(() => {
    const option = control.options.find(option => option.value === value)
    if (!option) return
    for (const [name, attribute] of Object.entries(option.attributes)) {
      if (attribute === null) document.documentElement.removeAttribute(name)
      else document.documentElement.setAttribute(name, attribute)
    }
    try {
      window.localStorage.setItem(control.storageKey, option.value)
    } catch {
      // Not remembered, but still applied for this page.
    }
  }, [control, value])

  const hidden = (option: Option) => option.hideOn?.includes(pathname)
  const chosen = control.options.find(option => option.value === value)
  const shownValue = chosen && hidden(chosen) ? chosen.sameAs : value

  return (
    <div
      role="group"
      aria-label={`${control.label} (development only)`}
      style={{ display: "flex", alignItems: "center", gap: 2 }}
    >
      {control.options
        .filter(option => !hidden(option))
        .map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => setValue(option.value)}
            aria-pressed={shownValue === option.value}
            style={{
              border: 0,
              borderRadius: 999,
              padding: "4px 10px",
              cursor: "pointer",
              background:
                shownValue === option.value ? "#ffffff" : "transparent",
              color: shownValue === option.value ? "#0f172a" : "#ffffff"
            }}
          >
            {option.label}
          </button>
        ))}
    </div>
  )
}

export default function DevSkinToggle() {
  const { pathname } = useRouter()
  if (process.env.NODE_ENV !== "development") return null

  return (
    <div
      style={{
        position: "fixed",
        left: 12,
        bottom: 12,
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 4,
        padding: 4,
        borderRadius: 14,
        background: "rgba(15, 23, 42, 0.85)",
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.25)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: 12
      }}
    >
      {CONTROLS.filter(
        control => !control.onlyOn || control.onlyOn.includes(pathname)
      ).map(control => (
        <Switch
          key={control.storageKey}
          control={control}
          pathname={pathname}
        />
      ))}
    </div>
  )
}
