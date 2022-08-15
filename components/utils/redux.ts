import {
  isRejected,
  isRejectedWithValue,
  Middleware,
  MiddlewareAPI
} from "@reduxjs/toolkit"

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
