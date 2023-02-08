import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
  useStore
} from "react-redux"
import type { AppDispatch, AppSelector, AppStore, RootState } from "./store"
import { createCreateAppThunk } from "./utils"

// Provides correctly-typed functions for interacting with the redux store.

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppStore: () => AppStore = () => useStore()
export const createAppThunk = createCreateAppThunk<RootState, AppDispatch>()
export const selectRootState = (s: any) => s as RootState
export const createAppSelector = <R>(
  selector: AppSelector<R>
): AppSelector<R> => selector
