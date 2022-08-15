import { useAuth } from "../auth"
import { UseEditTestimony, useEditTestimony } from "../db"
import { createService } from "../service"
import { usePublishState } from "./redux"

export type Service = UseEditTestimony

const { Provider, useBinding, useService } = createService<Service>()

const Service = () => {
  const uid = useAuth().user?.uid
  const billId = usePublishState().bill?.id
  const key = `${uid}-${billId}`

  if (uid && billId) {
    return <Binder key={key} uid={uid} billId={billId} />
  } else {
    return null
  }
}

const Binder = ({ uid, billId }: { uid: string; billId: string }) => {
  const service = useEditTestimony(uid, billId)
  useBinding(service)

  return null
}

export const Publish = { Service, Provider }
export const usePublishService = useService
