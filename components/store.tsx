import { configureStore, isPlain } from "@reduxjs/toolkit"
import { Timestamp } from "firebase/firestore"
import React, { useRef } from "react"
import { Provider as ReduxProvider } from "react-redux"
import { reducer as auth } from "./auth/redux"
import { api } from "./db/api"
import { reducer as profile } from "./db/profile/redux"
import { reducer as publish } from "./publish/redux"
import { slice as testimonyDetail } from "./testimony/TestimonyDetailPage"
import { rejectionLogger } from "./utils"
import { createWrapper } from "next-redux-wrapper"
import { cloneDeepWith } from "lodash"

const createStore = () =>
  configureStore({
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: {
          isSerializable: (value: any) =>
            isPlain(value) ||
            (typeof value === "object" && value instanceof Timestamp),
          ignoredPaths: ["auth.user", "publish.service"],
          ignoredActions: ["auth/authChanged", "publish/bindService"]
        }
      })
        .concat(api.middleware)
        .concat(rejectionLogger),
    reducer: {
      [api.reducerPath]: api.reducer,
      publish,
      auth,
      profile,
      [testimonyDetail.name]: testimonyDetail.reducer
    }
  })

const timestampKey = "__Timestamp"
export const wrapper = createWrapper<AppStore>(createStore, {
  serializeState: ({ testimonyDetail }) =>
    cloneDeepWith({ testimonyDetail }, v => {
      if (v instanceof Timestamp)
        return {
          [timestampKey]: v.toMillis()
        }
    }),
  deserializeState: state =>
    cloneDeepWith(state, v => {
      if (
        v &&
        typeof v === "object" &&
        timestampKey in v &&
        typeof v[timestampKey] === "number"
      ) {
        return Timestamp.fromMillis(v[timestampKey])
      }
    })
})

// https://redux-toolkit.js.org/tutorials/typescript
//
// Import these with `import type ...` to ensure that the store dependency is erased.
export type AppStore = ReturnType<typeof createStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]
export type AppSelector<Return> = (state: RootState) => Return
