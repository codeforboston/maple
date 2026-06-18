import { createContext, Dispatch, SetStateAction } from "react"

export type TabStatus = string | number

/* TabStatus never uses numbers however it gets used in a way 
   that links to EventKey which requires `string | number` */

interface TabContextType {
  tabStatus: TabStatus
  setTabStatus: Dispatch<SetStateAction<string | number>>
}

export const TabContext = createContext<TabContextType>({
  tabStatus: "AboutYou",
  setTabStatus: () => {}
})
