import { app } from "components/firebase"
import { Admin, DataProvider, Resource } from "react-admin"
import { FirebaseDataProvider } from "react-admin-firebase"
import {
  createMyOne,
  getMyListGroup,
  getMyMany,
  getMyOne,
  updateMyOne
} from "./dataProviderDbCalls"
import {
  CreateProfile,
  CreateReport,
  EditProfile,
  EditReports
} from "./editViews"
import { ListProfiles, ListPublishedTestimony, ListReports } from "./listsViews"
import { ShowProfile, ShowReports } from "./showViews"

import * as fb from "components/firebase"
import * as firestore from "firebase/firestore"
import * as dbCalls from "./dataProviderDbCalls"

const App = () => {
  console.log("data provider loading in moderation .txs")
  // const authProvider = FirebaseAuthProvider(app.options, {})
  const dataProvider = FirebaseDataProvider(app.options)
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

  return (
    <Admin dataProvider={myDataProvider}>
      <Resource
        name="reports"
        list={ListReports}
        edit={EditReports}
        show={ShowReports}
        create={CreateReport}
      />
      <Resource name="publishedTestimony" list={ListPublishedTestimony} />
      <Resource
        name="profiles"
        list={ListProfiles}
        show={ShowProfile}
        edit={EditProfile}
        create={CreateProfile}
      />
    </Admin>
  )
}

export default App
