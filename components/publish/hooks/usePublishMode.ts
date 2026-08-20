import { getPublishMode } from "../mode"
import { usePublishState } from "./usePublishState"

export const usePublishMode = () =>
  getPublishMode(usePublishState().ballotQuestionId)
