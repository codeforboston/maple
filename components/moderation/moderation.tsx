import { app, auth } from "components/firebase"
import { Admin, DataProvider, ListGuesser, Resource } from "react-admin"
import { FirebaseDataProvider } from "react-admin-firebase"
import { QueryClient, QueryClientProvider } from "react-query"
import { EditReports, ListReports } from "./"
import { ListProfiles } from "./ListProfiles"
import {
  createMyOne,
  getMyListGroup,
  getMyMany,
  getMyOne,
  updateMyOne
} from "./dataProviderDbCalls"

import * as fb from "components/firebase"
import * as firestore from "firebase/firestore"
import * as dbCalls from "./dataProviderDbCalls"
import { useEffect, useState } from "react"

const queryClient = new QueryClient()

const App = () => {
  console.log("data provider loading in moderation .txs")
  const dataProvider = FirebaseDataProvider({}, { logging: true, app })
  const myDataProvider: DataProvider = {
    ...dataProvider,
    getList: getMyListGroup,
    getOne: getMyOne,
    getMany: getMyMany,
    create: createMyOne,
    update: updateMyOne
  }

  if (!("dbCalls" in window)) {
    Object.assign(window as any, { dbCalls, firestore, fb })
  }

  const [showAuth, setShowAuth] = useState<string>("logged in?")

  useEffect(() => {
    ;(async () => {
      const token = await auth.currentUser?.getIdTokenResult()
      setShowAuth(token?.claims.role?.toString() ?? "not logged in")
    })()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <Admin dataProvider={myDataProvider}>
        <Resource
          name="reports"
          list={ListReports}
          edit={EditReports}
          options={{ label: "User Reports" }}
        />
        <Resource
          name="profiles"
          list={ListProfiles}
          options={{ label: "Upgrade Requests" }}
        />
        <Resource
          name="users"
          list={ListGuesser}
          options={{ label: `snd in as ${showAuth}` }}
        />
      </Admin>
    </QueryClientProvider>
  )
}

export default App
