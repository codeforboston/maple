import { useEffect } from "react"
import { shallowEqual } from "react-redux"
import { useEditTestimony } from "../../db"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { bindService, Service } from "../redux"
import { useFormSync } from "./useFormSync"
import { usePublishState } from "./usePublishState"

/** Access the publish service */
export const usePublishService = () =>
  useAppSelector(s => s.publish.service, shallowEqual)

usePublishService.Provider = Provider

/** Binds the publish service */
function Provider() {
  const state = usePublishState(),
    billId = state.bill?.id,
    uid = state.authorUid,
    key = `${billId}-${uid}`

  return billId && uid ? <Binder billId={billId} uid={uid} key={key} /> : null
}

function Binder({ billId, uid }: { billId: string; uid: string }) {
  const edit = useEditTestimony(uid, billId)
  useBinding(edit)
  useFormSync(edit)

  return null
}

function useBinding(edit: Service) {
  const dispatch = useAppDispatch()
  useEffect(() => void dispatch(bindService(edit)), [dispatch, edit])
  // Clear the hook on unmount
  useEffect(() => () => void dispatch(bindService(undefined)), [dispatch])
}
