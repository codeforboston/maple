import { app } from "components/firebase"
import { Admin, DataProvider, Resource } from "react-admin"
import { FirebaseDataProvider } from "react-admin-firebase"
import { QueryClient, QueryClientProvider } from "react-query"
import { EditReports, ListReports } from "./"
import { ListProfiles } from "./ListProfiles"
import { ScrapeHearingList } from "./ScrapeHearing"
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

const queryClient = new QueryClient()

const App = () => {
  console.log("data provider loading in moderation .txs")

  const dataProvider = FirebaseDataProvider({}, { logging: false, app })
  const myDataProvider: DataProvider = {
    ...dataProvider,
    getOne: getMyOne,
    getMany: getMyMany,
    create: createMyOne,
    update: updateMyOne
  }

  if (!("dbCalls" in window)) {
    Object.assign(window as any, { dbCalls, firestore, fb })
  }

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
          name="scrape-hearing"
          list={ScrapeHearingList}
          options={{ label: "Scrape Hearing" }}
        />
      </Admin>
    </QueryClientProvider>
  )
}

export default App
