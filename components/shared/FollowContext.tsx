import { createContext, Dispatch, SetStateAction } from "react"

export type OrgFollowStatus = Record<string, boolean>

interface FollowContextType {
  followStatus: OrgFollowStatus
  setFollowStatus: Dispatch<SetStateAction<OrgFollowStatus>>
}

export const FollowContext = createContext<FollowContextType>({
  followStatus: {},
  setFollowStatus: () => {}
})
