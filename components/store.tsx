import { configureStore, isPlain } from "@reduxjs/toolkit"
import { Timestamp } from "firebase/firestore"
import React, { useRef } from "react"
import { Provider as ReduxProvider } from "react-redux"
import { reducer as auth } from "./auth/redux"
import { reducer as profile } from "./db/profile/redux"
import { reducer as publish } from "./publish/redux"
import { rejectionLogger } from "./utils"

export const createStore = () =>
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
      }).concat(rejectionLogger),
    reducer: {
      publish,
      auth,
      profile
    }
  })

export const Provider: React.FC<{}> = ({ children }) => {
  const storeRef = useRef<AppStore>()
  if (!storeRef.current) storeRef.current = createStore()
  return <ReduxProvider store={storeRef.current}>{children}</ReduxProvider>
}

// https://redux-toolkit.js.org/tutorials/typescript
//
// Import these with `import type ...` to ensure that the store dependency is erased.
export type AppStore = ReturnType<typeof createStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]
