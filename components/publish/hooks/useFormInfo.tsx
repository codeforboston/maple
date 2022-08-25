import { useEffect, useState } from "react"
import { useProfileState } from "../../db/profile/redux"
import { usePublishState } from "./usePublishState"

export function useFormInfo() {
  const { bill, authorUid, sync, step } = usePublishState()
  const profile = useProfileState().profile
  const [init, setInit] = useState<"uninitialized" | "mounted" | "initialized">(
    "uninitialized"
  )
  const ready = init === "initialized" && bill && authorUid && profile
  const synced = sync === "synced"

  // wait for unmount effects to run before tracking initialization
  useEffect(() => setInit("mounted"), [])
  useEffect(() => {
    if (synced && init === "mounted") setInit("initialized")
  }, [synced, init])

  if (ready) {
    return { ready: true, bill, authorUid, profile, step, synced } as const
  } else {
    return { ready: false } as const
  }
}
