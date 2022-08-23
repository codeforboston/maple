import { shallowEqual } from "react-redux"
import { useAppSelector } from "../../hooks"

export type PublishState = ReturnType<typeof usePublishState>
export const usePublishState = () =>
  useAppSelector(
    ({ publish: { service: edit, ...rest } }) => rest,
    shallowEqual
  )
