import { usePublishForm } from "./hooks"
import { usePublishState } from "./redux"

export const PublishService = () => {
  const state = usePublishState(),
    billId = state.bill?.id,
    uid = state.authorUid,
    key = `${billId}-${uid}`

  return billId && uid ? <Binder billId={billId} uid={uid} key={key} /> : null
}

export const Binder = ({ billId, uid }: { billId: string; uid: string }) => {
  usePublishForm(billId, uid)
  return null
}
