import { createContext, Dispatch, SetStateAction } from "react"

export type TabStatus = string | number

interface TabContextType {
  tabStatus: TabStatus
  setTabStatus: Dispatch<SetStateAction<string | number>>
}

export const TabContext = createContext<TabContextType>({
  tabStatus: "AboutYou",
  setTabStatus: () => {}
})
