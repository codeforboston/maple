import { app } from "components/firebase"
import { Admin, DataProvider, Resource } from "react-admin"
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
import { onAuthStateChanged } from "firebase/auth"
import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"

const queryClient = new QueryClient()

const App = () => {
  console.log("data provider loading in moderation .txs")
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  const checkClaims = useCallback(async () => {
    const { currentUser } = fb.auth
    if (!currentUser) {
      router.push("/login")
    }
    const token = await currentUser?.getIdTokenResult(true)
    const isAdmin = token?.claims?.role === "admin"
    if (!isAdmin) {
      router.push("/")
    }
    setIsAdmin(true)
  }, [])

  useEffect(() => {
    if (isAdmin) checkClaims()
    const unsubscribe = onAuthStateChanged(fb.auth, () => setIsAdmin(false))
    return () => unsubscribe()
  }, [])

  const dataProvider = FirebaseDataProvider({}, { logging: true, app })
  const myDataProvider: DataProvider = {
    ...dataProvider,
    getList: getMyListGroup,
    getOne: getMyOne,
    getMany: getMyMany,
    create: createMyOne,
    update: updateMyOne
  }

  // if (!("dbCalls" in window)) {
  //   Object.assign(window as any, { dbCalls, firestore, fb })
  // }

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
      </Admin>
    </QueryClientProvider>
  )
}

export default App
