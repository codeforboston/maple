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
import { CreateReport, EditReports } from "./editViews"
import { ListPublishedTestimony, ListReports } from "./listsViews"
import { ShowReports } from "./showViews"

const App = () => {
  console.log("data provider loading in moderation .txs")
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
    </Admin>
  )
}

export default App
