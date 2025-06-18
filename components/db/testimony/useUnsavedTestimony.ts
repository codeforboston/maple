import { DraftTestimony } from "common/testimony/types"
import { useReducer } from "react"

type State = Pick<DraftTestimony, "attachmentId" | "content" | "position">

export type SetTestimony = (t: Partial<DraftTestimony>) => void
export function useUnsavedTestimony(): [Partial<DraftTestimony>, SetTestimony] {
  const [testimony, setTestimony] = useReducer(
    (state: Partial<State>, action: Partial<State>) => ({
      ...state,
      ...action
    }),
    {}
  )
  return [testimony, setTestimony]
}
