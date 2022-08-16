import { useAuth } from "../auth"
import { useFormPersistence } from "./hooks"
import { usePublishState } from "./redux"

export const PublishService = () => {
  const billId = usePublishState().bill?.id
  const uid = useAuth().user?.uid

  return billId && uid ? <Binder billId={billId} uid={uid} /> : null
}

export const Binder = ({ billId, uid }: { billId: string; uid: string }) => {
  useFormPersistence(billId, uid)
  return null
}
