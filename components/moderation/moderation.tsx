import { app } from "components/firebase"
import { Admin, DataProvider, ListGuesser, Resource } from "react-admin"
import {
  FirebaseAuthProvider,
  FirebaseDataProvider
} from "react-admin-firebase"
import {
  createMyOne,
  getMyListGroup,
  getMyMany,
  getMyOne,
  updateMyOne
} from "./dataProviderDbCalls"
import { CreateReport, EditReports } from "./editViews"
import { ListPublishedTestimony, ListReports } from "./listsViews"
import { ShowReports } from "./showViews"

const App = () => {
  console.log("data provider loading in moderation .txs")
  const authProvider = FirebaseAuthProvider(app.options, {})
  const dataProvider = FirebaseDataProvider(app.options)
  const myDataProvider: DataProvider = {
    ...dataProvider,
    getList: getMyListGroup,
    getOne: getMyOne,
    getMany: getMyMany,
    create: createMyOne,
    update: updateMyOne
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
      <Resource name="users" list={ListGuesser} />
    </Admin>
  )
}

export default App
