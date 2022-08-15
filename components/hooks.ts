import {
  AsyncThunkOptions,
  AsyncThunkPayloadCreator,
  createAsyncThunk
} from "@reduxjs/toolkit"
import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
  useStore
} from "react-redux"
import type { AppDispatch, AppStore, RootState } from "./store"

// Provides correctly-typed functions for interacting with the redux store.

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppStore: () => AppStore = () => useStore()

type ThunkConfig = {
  state: RootState
  dispatch: AppDispatch
}

export const createAppThunk = <Returned, ThunkArg = void>(
  type: string,
  payloadCreator: AsyncThunkPayloadCreator<Returned, ThunkArg, ThunkConfig>,
  options?: AsyncThunkOptions<ThunkArg, ThunkConfig>
) =>
  createAsyncThunk<Returned, ThunkArg, ThunkConfig>(
    type,
    payloadCreator,
    options
  )
