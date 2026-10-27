import { createContext, useContext } from "react"

/** What a card needs from the page around it: who is looking, and what the
 * actions on an entry do. */
type InputContextValue = {
  /** The viewer, or undefined while signed out. */
  uid?: string
  /** What the conference is called, for the headings an opened entry carries. */
  subject: string
  /** The authors the viewer follows. */
  followed: Set<string>
  /** Reopen the panel on the viewer's own entry; absent once the conference
   * stops taking testimony. */
  onEdit?: () => void
  /** Whether an entry can be followed or reported by this viewer. */
  signedIn: boolean
}

export const InputContext = createContext<InputContextValue>({
  subject: "",
  followed: new Set(),
  signedIn: false
})

export const useInputContext = () => useContext(InputContext)
