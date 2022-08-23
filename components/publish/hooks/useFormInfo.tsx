import { useEffect, useState } from "react"
import { useProfileState } from "../../db/profile/redux"
import { usePublishState } from "./usePublishState"

export function useFormInfo() {
  const { bill, authorUid, sync, step } = usePublishState()
  const profile = useProfileState().profile
  const [initialized, setInitialized] = useState(false)
  const ready = initialized && bill && authorUid && profile
  const synced = sync === "synced"

  useEffect(() => {
    if (synced) setInitialized(true)
  }, [synced])

  if (ready) {
    return { ready: true, bill, authorUid, profile, step, synced } as const
  } else {
    return { ready: false } as const
  }
}
