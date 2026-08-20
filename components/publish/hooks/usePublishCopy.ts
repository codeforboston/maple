import { useCallback } from "react"
import { useTranslation } from "next-i18next"
import { usePublishMode } from "./usePublishMode"

export const usePublishCopy = () => {
  const { t } = useTranslation("testimony")
  const mode = usePublishMode()
  const isBallotQuestion = mode === "ballotQuestion"

  const copy = useCallback(
    (
      billKey: string,
      ballotQuestionKey: string,
      options?: Record<string, any>
    ) => t(isBallotQuestion ? ballotQuestionKey : billKey, options),
    [isBallotQuestion, t]
  )

  return { t, copy, mode, isBallotQuestion }
}
