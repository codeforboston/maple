import {
  createAction,
  createAsyncThunk,
  Dispatch,
  isRejected,
  isRejectedWithValue,
  Middleware,
  MiddlewareAPI
} from "@reduxjs/toolkit"

import type {
  AsyncThunkFulfilledActionCreator,
  AsyncThunkOptions,
  AsyncThunkPayloadCreator,
  AsyncThunkPendingActionCreator,
  AsyncThunkRejectedActionCreator
} from "@reduxjs/toolkit/dist/createAsyncThunk"

export type AsyncThunkActions<
  Returned,
  ThunkArg = void,
  ThunkApiConfig = {}
> = {
  pending: AsyncThunkPendingActionCreator<ThunkArg, ThunkApiConfig>
  rejected: AsyncThunkRejectedActionCreator<ThunkArg, ThunkApiConfig>
  fulfilled: AsyncThunkFulfilledActionCreator<
    Returned,
    ThunkArg,
    ThunkApiConfig
  >
  typePrefix: string
}

/**
 * Create dummy action creators suitable for matching async thunks. These allow
 * a slice to define async thunk types while implementing them outside the
 * slice. The actions will throw if dispatched.
 */
export function declareThunk<Returned = undefined, ThunkArg = void>(
  typePrefix: string
): AsyncThunkActions<Returned, ThunkArg> {
  return {
    pending: createActionMatcher(typePrefix, "pending"),
    fulfilled: createActionMatcher(typePrefix, "fulfilled"),
    rejected: createActionMatcher(typePrefix, "rejected"),
    typePrefix
  }
}

function createActionMatcher(typePrefix: string, suffix: string): any {
  return createAction(typePrefix + "/" + suffix, () => {
    throw Error("Do not dispatch. Should only be used for matching.")
  })
}

/**
 * Log a warning for all rejected actions
 */
export const rejectionLogger: Middleware =
  (api: MiddlewareAPI) => next => action => {
    if (isRejectedWithValue(action) || isRejected(action)) {
      console.log("Async error!", action, action.error.stack)
    }
    return next(action)
  }

/** App-typed version of the Thunk API */
export type AsyncThunkConfig<RootState, AppDispatch extends Dispatch> = {
  state: RootState
  dispatch: AppDispatch
}

/** Applies app types to `createAsyncThunk`, and allows passing a predeclared
 * thunk created by `declareThunk`.*/
export const createCreateAppThunk =
  <RootState, AppDispatch extends Dispatch>() =>
  <Returned, ThunkArg = void>(
    typeOrActions: string | AsyncThunkActions<Returned, any>,
    payloadCreator: AsyncThunkPayloadCreator<
      Returned,
      ThunkArg,
      AsyncThunkConfig<RootState, AppDispatch>
    >,
    options?: AsyncThunkOptions<
      ThunkArg,
      AsyncThunkConfig<RootState, AppDispatch>
    >
  ) =>
    createAsyncThunk<
      Returned,
      ThunkArg,
      AsyncThunkConfig<RootState, AppDispatch>
    >(
      typeof typeOrActions === "string"
        ? typeOrActions
        : typeOrActions.typePrefix,
      payloadCreator,
      options
    )
