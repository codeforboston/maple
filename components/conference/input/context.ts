import { createContext, useContext } from "react"
import { ConferenceTestimony } from "components/db"

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
  /** Open the panel to cosign an entry; absent while the viewer cannot cosign
   * anything here. A signed-out viewer can, which takes them to sign in. */
  onCosign?: (testimony: ConferenceTestimony) => void
  /** The conference's entries by id, which is how a cosign names its parent. */
  byId: Map<string, ConferenceTestimony>
}

export const InputContext = createContext<InputContextValue>({
  subject: "",
  followed: new Set(),
  signedIn: false,
  byId: new Map()
})

export const useInputContext = () => useContext(InputContext)
